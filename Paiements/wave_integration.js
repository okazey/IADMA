// Wave Payment Integration for IADMA
// Documentation: https://docs.wave.com/

class WavePayment {
    constructor(apiKey, secretKey, environment = 'sandbox') {
        this.apiKey = apiKey;
        this.secretKey = secretKey;
        this.baseUrl = environment === 'production' 
            ? 'https://api.wave.com/v1' 
            : 'https://api.sandbox.wave.com/v1';
    }

    // Créer un paiement Wave
    async createPayment(paymentData) {
        const {
            amount,
            currency = 'XOF', // Franc CFA
            customer_email,
            customer_firstname,
            customer_lastname,
            success_url,
            error_url,
            course_id,
            user_id
        } = paymentData;

        const payload = {
            amount: amount * 100, // Wave utilise les centimes
            currency,
            customer: {
                email: customer_email,
                first_name: customer_firstname,
                last_name: customer_lastname
            },
            success_url: `${success_url}?course_id=${course_id}&user_id=${user_id}`,
            error_url: `${error_url}?course_id=${course_id}&user_id=${user_id}`,
            metadata: {
                course_id: course_id.toString(),
                user_id: user_id.toString(),
                platform: 'IADMA'
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}/checkout/sessions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (response.ok) {
                return {
                    success: true,
                    checkout_url: result.wave_launch_url,
                    session_id: result.id,
                    payment_id: result.id
                };
            } else {
                throw new Error(result.message || 'Erreur lors de la création du paiement');
            }
        } catch (error) {
            console.error('Erreur Wave Payment:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Vérifier le statut d'un paiement
    async checkPaymentStatus(sessionId) {
        try {
            const response = await fetch(`${this.baseUrl}/checkout/sessions/${sessionId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            const result = await response.json();
            
            if (response.ok) {
                return {
                    success: true,
                    status: result.payment_status, // 'pending', 'successful', 'failed'
                    amount: result.amount / 100,
                    currency: result.currency,
                    metadata: result.metadata
                };
            } else {
                throw new Error(result.message || 'Erreur lors de la vérification');
            }
        } catch (error) {
            console.error('Erreur vérification paiement:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Webhook pour les notifications de paiement
    verifyWebhookSignature(payload, signature) {
        const crypto = require('crypto');
        const computedSignature = crypto
            .createHmac('sha256', this.secretKey)
            .update(payload)
            .digest('hex');
        
        return signature === computedSignature;
    }
}

// Configuration des prix IADMA
const IADMA_PRICES = {
    'competences_digitales_base': {
        price: 15000,
        currency: 'XOF',
        duration: '2 semaines',
        name: 'Compétences digitales de base'
    },
    'developpement_web_mobile': {
        price: 30000,
        currency: 'XOF',
        duration: '6 semaines',
        name: 'Développement web & mobile'
    },
    'entrepreneuriat_creation': {
        price: 25000,
        currency: 'XOF',
        duration: '4 semaines',
        name: 'Entrepreneuriat & création d\'entreprise'
    },
    'abonnement_mensuel': {
        price: 20000,
        currency: 'XOF',
        duration: '1 mois',
        name: 'Accès illimité - Abonnement mensuel'
    }
};

// Gestionnaire de paiements IADMA
class IADMAPaymentManager {
    constructor() {
        this.wave = new WavePayment(
            process.env.WAVE_API_KEY,
            process.env.WAVE_SECRET_KEY,
            process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
        );
    }

    // Initier un paiement pour une formation
    async initiatePayment(courseId, userId, userInfo) {
        const courseInfo = IADMA_PRICES[courseId];
        
        if (!courseInfo) {
            return {
                success: false,
                error: 'Formation non trouvée'
            };
        }

        const paymentData = {
            amount: courseInfo.price,
            currency: courseInfo.currency,
            customer_email: userInfo.email,
            customer_firstname: userInfo.firstname,
            customer_lastname: userInfo.lastname,
            success_url: `${process.env.SITE_URL}/payment/success`,
            error_url: `${process.env.SITE_URL}/payment/error`,
            course_id: courseId,
            user_id: userId
        };

        const result = await this.wave.createPayment(paymentData);
        
        if (result.success) {
            // Enregistrer la transaction en base
            await this.saveTransaction({
                user_id: userId,
                course_id: courseId,
                amount: courseInfo.price,
                currency: courseInfo.currency,
                payment_id: result.payment_id,
                status: 'pending',
                created_at: new Date()
            });
        }

        return result;
    }

    // Traitement du webhook Wave
    async handleWebhook(req, res) {
        const signature = req.headers['x-wave-signature'];
        const payload = JSON.stringify(req.body);

        // Vérifier la signature
        if (!this.wave.verifyWebhookSignature(payload, signature)) {
            return res.status(401).json({ error: 'Signature invalide' });
        }

        const event = req.body;
        
        if (event.type === 'checkout.session.completed') {
            await this.handleSuccessfulPayment(event.data);
        } else if (event.type === 'checkout.session.failed') {
            await this.handleFailedPayment(event.data);
        }

        res.status(200).json({ received: true });
    }

    // Traitement paiement réussi
    async handleSuccessfulPayment(sessionData) {
        const { id: sessionId, metadata } = sessionData;
        const { course_id, user_id } = metadata;

        try {
            // Mettre à jour le statut de la transaction
            await this.updateTransactionStatus(sessionId, 'completed');

            // Inscrire l'utilisateur au cours
            await this.enrollUserInCourse(user_id, course_id);

            // Envoyer email de confirmation
            await this.sendPaymentConfirmationEmail(user_id, course_id);

            // Générer le certificat d'inscription
            await this.generateEnrollmentCertificate(user_id, course_id);

            console.log(`Paiement réussi: User ${user_id} inscrit au cours ${course_id}`);
        } catch (error) {
            console.error('Erreur traitement paiement réussi:', error);
        }
    }

    // Traitement paiement échoué
    async handleFailedPayment(sessionData) {
        const { id: sessionId, metadata } = sessionData;
        
        try {
            await this.updateTransactionStatus(sessionId, 'failed');
            
            // Envoyer email d'échec avec options de retry
            await this.sendPaymentFailureEmail(metadata.user_id, metadata.course_id);
            
            console.log(`Paiement échoué: Session ${sessionId}`);
        } catch (error) {
            console.error('Erreur traitement paiement échoué:', error);
        }
    }

    // Sauvegarder transaction en base
    async saveTransaction(transactionData) {
        // Implémentation avec votre ORM (Prisma, Sequelize, etc.)
        // Exemple avec une base de données fictive
        const db = require('./database');
        
        return await db.transactions.create(transactionData);
    }

    // Mettre à jour statut transaction
    async updateTransactionStatus(paymentId, status) {
        const db = require('./database');
        
        return await db.transactions.update(
            { status, updated_at: new Date() },
            { where: { payment_id: paymentId } }
        );
    }

    // Inscrire utilisateur au cours
    async enrollUserInCourse(userId, courseId) {
        const db = require('./database');
        
        // Vérifier si déjà inscrit
        const existingEnrollment = await db.enrollments.findOne({
            where: { user_id: userId, course_id: courseId }
        });

        if (!existingEnrollment) {
            return await db.enrollments.create({
                user_id: userId,
                course_id: courseId,
                enrolled_at: new Date(),
                status: 'active'
            });
        }
    }

    // Envoyer email de confirmation
    async sendPaymentConfirmationEmail(userId, courseId) {
        const emailService = require('./email-service');
        const db = require('./database');
        
        const user = await db.users.findByPk(userId);
        const course = IADMA_PRICES[courseId];
        
        const emailData = {
            to: user.email,
            subject: `Inscription confirmée - ${course.name}`,
            template: 'payment-confirmation',
            data: {
                user_name: `${user.firstname} ${user.lastname}`,
                course_name: course.name,
                course_duration: course.duration,
                login_url: `${process.env.SITE_URL}/login`
            }
        };

        return await emailService.send(emailData);
    }

    // Générer certificat d'inscription
    async generateEnrollmentCertificate(userId, courseId) {
        const certificateService = require('./certificate-service');
        
        return await certificateService.generateEnrollmentCertificate({
            user_id: userId,
            course_id: courseId,
            issued_at: new Date()
        });
    }
}

// Export pour utilisation
module.exports = {
    WavePayment,
    IADMAPaymentManager,
    IADMA_PRICES
};

// Exemple d'utilisation
/*
const paymentManager = new IADMAPaymentManager();

// Initier un paiement
const result = await paymentManager.initiatePayment(
    'competences_digitales_base',
    123,
    {
        email: 'user@example.com',
        firstname: 'John',
        lastname: 'Doe'
    }
);

if (result.success) {
    // Rediriger vers result.checkout_url
    window.location.href = result.checkout_url;
} else {
    console.error('Erreur paiement:', result.error);
}
*/
