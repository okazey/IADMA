// PayPal Integration for IADMA
// Documentation: https://developer.paypal.com/docs/api/

class PayPalPayment {
    constructor(clientId, clientSecret, environment = 'sandbox') {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.baseUrl = environment === 'production' 
            ? 'https://api.paypal.com' 
            : 'https://api.sandbox.paypal.com';
        this.accessToken = null;
    }

    // Obtenir un token d'accès
    async getAccessToken() {
        if (this.accessToken) return this.accessToken;

        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        
        try {
            const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'grant_type=client_credentials'
            });

            const data = await response.json();
            
            if (response.ok) {
                this.accessToken = data.access_token;
                // Renouveler le token avant expiration
                setTimeout(() => {
                    this.accessToken = null;
                }, (data.expires_in - 60) * 1000);
                
                return this.accessToken;
            } else {
                throw new Error(data.error_description || 'Erreur authentification PayPal');
            }
        } catch (error) {
            console.error('Erreur PayPal Auth:', error);
            throw error;
        }
    }

    // Créer un paiement PayPal
    async createPayment(paymentData) {
        const token = await this.getAccessToken();
        const {
            amount,
            currency = 'EUR',
            description,
            return_url,
            cancel_url,
            course_id,
            user_id
        } = paymentData;

        const payload = {
            intent: 'sale',
            payer: {
                payment_method: 'paypal'
            },
            transactions: [{
                amount: {
                    total: amount.toFixed(2),
                    currency: currency
                },
                description: description,
                custom: JSON.stringify({
                    course_id,
                    user_id,
                    platform: 'IADMA'
                })
            }],
            redirect_urls: {
                return_url: `${return_url}?course_id=${course_id}&user_id=${user_id}`,
                cancel_url: `${cancel_url}?course_id=${course_id}&user_id=${user_id}`
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}/v1/payments/payment`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (response.ok) {
                const approvalUrl = result.links.find(link => link.rel === 'approval_url');
                
                return {
                    success: true,
                    payment_id: result.id,
                    approval_url: approvalUrl.href
                };
            } else {
                throw new Error(result.message || 'Erreur création paiement PayPal');
            }
        } catch (error) {
            console.error('Erreur PayPal Payment:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Exécuter un paiement approuvé
    async executePayment(paymentId, payerId) {
        const token = await this.getAccessToken();

        try {
            const response = await fetch(`${this.baseUrl}/v1/payments/payment/${paymentId}/execute`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    payer_id: payerId
                })
            });

            const result = await response.json();
            
            if (response.ok && result.state === 'approved') {
                return {
                    success: true,
                    transaction_id: result.transactions[0].related_resources[0].sale.id,
                    amount: result.transactions[0].amount.total,
                    currency: result.transactions[0].amount.currency,
                    custom_data: JSON.parse(result.transactions[0].custom || '{}')
                };
            } else {
                throw new Error(result.message || 'Erreur exécution paiement');
            }
        } catch (error) {
            console.error('Erreur exécution PayPal:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Mobile Money Integration (Orange Money, MTN, etc.)
class MobileMoneyPayment {
    constructor(apiKey, merchantId, environment = 'sandbox') {
        this.apiKey = apiKey;
        this.merchantId = merchantId;
        this.baseUrl = environment === 'production' 
            ? 'https://api.mobilemoney.com/v1' 
            : 'https://api.sandbox.mobilemoney.com/v1';
    }

    // Initier paiement Mobile Money
    async createPayment(paymentData) {
        const {
            amount,
            currency = 'XOF',
            phone_number,
            operator, // 'orange', 'mtn', 'moov'
            course_id,
            user_id
        } = paymentData;

        const payload = {
            merchant_id: this.merchantId,
            amount: amount,
            currency: currency,
            phone_number: phone_number,
            operator: operator,
            description: `Formation IADMA - ${course_id}`,
            metadata: {
                course_id: course_id.toString(),
                user_id: user_id.toString(),
                platform: 'IADMA'
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}/payments`, {
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
                    transaction_id: result.transaction_id,
                    status: result.status, // 'pending', 'success', 'failed'
                    message: result.message
                };
            } else {
                throw new Error(result.message || 'Erreur paiement Mobile Money');
            }
        } catch (error) {
            console.error('Erreur Mobile Money:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Vérifier statut paiement Mobile Money
    async checkPaymentStatus(transactionId) {
        try {
            const response = await fetch(`${this.baseUrl}/payments/${transactionId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            const result = await response.json();
            
            if (response.ok) {
                return {
                    success: true,
                    status: result.status,
                    amount: result.amount,
                    currency: result.currency,
                    metadata: result.metadata
                };
            } else {
                throw new Error(result.message || 'Erreur vérification Mobile Money');
            }
        } catch (error) {
            console.error('Erreur vérification Mobile Money:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Gestionnaire unifié des paiements IADMA
class IADMAUnifiedPayment {
    constructor() {
        this.paypal = new PayPalPayment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET,
            process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
        );
        
        this.mobileMoney = new MobileMoneyPayment(
            process.env.MOBILE_MONEY_API_KEY,
            process.env.MOBILE_MONEY_MERCHANT_ID,
            process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
        );

        // Import Wave depuis le fichier précédent
        const { IADMAPaymentManager } = require('./wave_integration');
        this.wave = new IADMAPaymentManager();
    }

    // Déterminer la meilleure méthode de paiement selon la région
    getRecommendedPaymentMethod(country, amount) {
        const recommendations = {
            // Afrique de l'Ouest (FCFA)
            'SN': ['wave', 'mobile_money', 'paypal'], // Sénégal
            'ML': ['wave', 'mobile_money', 'paypal'], // Mali
            'BF': ['mobile_money', 'wave', 'paypal'], // Burkina Faso
            'CI': ['mobile_money', 'wave', 'paypal'], // Côte d'Ivoire
            'GH': ['mobile_money', 'paypal', 'wave'], // Ghana
            'NG': ['paypal', 'mobile_money', 'wave'], // Nigeria
            
            // International
            'default': ['paypal', 'wave']
        };

        return recommendations[country] || recommendations['default'];
    }

    // Interface unifiée pour initier un paiement
    async initiatePayment(paymentMethod, paymentData) {
        switch (paymentMethod) {
            case 'wave':
                return await this.wave.initiatePayment(
                    paymentData.course_id,
                    paymentData.user_id,
                    paymentData.user_info
                );
                
            case 'paypal':
                return await this.paypal.createPayment({
                    amount: paymentData.amount / 655.957, // Conversion FCFA vers EUR approximative
                    currency: 'EUR',
                    description: `Formation IADMA - ${paymentData.course_name}`,
                    return_url: `${process.env.SITE_URL}/payment/paypal/success`,
                    cancel_url: `${process.env.SITE_URL}/payment/paypal/cancel`,
                    course_id: paymentData.course_id,
                    user_id: paymentData.user_id
                });
                
            case 'mobile_money':
                return await this.mobileMoney.createPayment({
                    amount: paymentData.amount,
                    currency: 'XOF',
                    phone_number: paymentData.phone_number,
                    operator: paymentData.operator,
                    course_id: paymentData.course_id,
                    user_id: paymentData.user_id
                });
                
            default:
                return {
                    success: false,
                    error: 'Méthode de paiement non supportée'
                };
        }
    }

    // Traitement des webhooks unifiés
    async handleWebhook(provider, req, res) {
        switch (provider) {
            case 'wave':
                return await this.wave.handleWebhook(req, res);
                
            case 'paypal':
                return await this.handlePayPalWebhook(req, res);
                
            case 'mobile_money':
                return await this.handleMobileMoneyWebhook(req, res);
                
            default:
                return res.status(400).json({ error: 'Provider non reconnu' });
        }
    }

    // Webhook PayPal
    async handlePayPalWebhook(req, res) {
        // Vérification signature PayPal
        const event = req.body;
        
        if (event.event_type === 'PAYMENT.SALE.COMPLETED') {
            const saleId = event.resource.id;
            const customData = JSON.parse(event.resource.custom || '{}');
            
            await this.handleSuccessfulPayment({
                provider: 'paypal',
                transaction_id: saleId,
                course_id: customData.course_id,
                user_id: customData.user_id,
                amount: event.resource.amount.total,
                currency: event.resource.amount.currency
            });
        }
        
        res.status(200).json({ received: true });
    }

    // Traitement unifié des paiements réussis
    async handleSuccessfulPayment(paymentInfo) {
        const { provider, transaction_id, course_id, user_id, amount, currency } = paymentInfo;
        
        try {
            // Enregistrer la transaction
            await this.saveTransaction({
                provider,
                transaction_id,
                user_id,
                course_id,
                amount,
                currency,
                status: 'completed',
                completed_at: new Date()
            });

            // Inscrire l'utilisateur
            await this.enrollUserInCourse(user_id, course_id);

            // Notifications
            await this.sendSuccessNotifications(user_id, course_id, provider);

            console.log(`Paiement ${provider} réussi: User ${user_id} -> Course ${course_id}`);
        } catch (error) {
            console.error('Erreur traitement paiement unifié:', error);
        }
    }

    // Envoyer notifications de succès
    async sendSuccessNotifications(userId, courseId, provider) {
        const emailService = require('./email-service');
        const smsService = require('./sms-service');
        
        // Email de confirmation
        await emailService.sendPaymentConfirmation(userId, courseId, provider);
        
        // SMS de confirmation (pour Mobile Money)
        if (provider === 'mobile_money') {
            await smsService.sendPaymentConfirmation(userId, courseId);
        }
        
        // Notification push (si app mobile)
        const pushService = require('./push-service');
        await pushService.sendPaymentSuccess(userId, courseId);
    }
}

module.exports = {
    PayPalPayment,
    MobileMoneyPayment,
    IADMAUnifiedPayment
};

// Exemple d'utilisation
/*
const paymentManager = new IADMAUnifiedPayment();

// Recommandation de méthode de paiement
const methods = paymentManager.getRecommendedPaymentMethod('SN', 15000);
console.log('Méthodes recommandées:', methods); // ['wave', 'mobile_money', 'paypal']

// Initier un paiement
const result = await paymentManager.initiatePayment('wave', {
    course_id: 'competences_digitales_base',
    user_id: 123,
    amount: 15000,
    user_info: {
        email: 'user@example.com',
        firstname: 'Amadou',
        lastname: 'Diallo'
    }
});
*/
