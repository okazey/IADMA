// Certificate Generation System for IADMA
// Génération de certificats numériques avec QR code de vérification

const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class IADMACertificateGenerator {
    constructor() {
        this.certificateTemplate = {
            width: 842, // A4 landscape
            height: 595,
            margins: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50
            }
        };
        
        this.colors = {
            primary: '#1E40AF',
            accent: '#F97316',
            success: '#059669',
            text: '#111827',
            lightGray: '#F3F4F6'
        };
    }

    // Générer un certificat de formation
    async generateCertificate(certificateData) {
        const {
            student_name,
            course_name,
            course_duration,
            completion_date,
            grade,
            instructor_name,
            certificate_id,
            user_id,
            course_id
        } = certificateData;

        // Créer un ID unique pour le certificat
        const uniqueId = this.generateCertificateId(user_id, course_id, completion_date);
        
        // Générer le QR code de vérification
        const verificationUrl = `${process.env.SITE_URL}/verify-certificate/${uniqueId}`;
        const qrCodeBuffer = await this.generateQRCode(verificationUrl);
        
        // Créer le PDF
        const pdfBuffer = await this.createPDFCertificate({
            ...certificateData,
            certificate_id: uniqueId,
            qr_code: qrCodeBuffer,
            verification_url: verificationUrl
        });

        // Sauvegarder en base de données
        await this.saveCertificateRecord({
            certificate_id: uniqueId,
            user_id,
            course_id,
            student_name,
            course_name,
            completion_date,
            grade,
            verification_url,
            pdf_path: `certificates/${uniqueId}.pdf`,
            created_at: new Date()
        });

        return {
            success: true,
            certificate_id: uniqueId,
            pdf_buffer: pdfBuffer,
            verification_url: verificationUrl,
            download_url: `${process.env.SITE_URL}/certificates/${uniqueId}.pdf`
        };
    }

    // Générer un ID unique pour le certificat
    generateCertificateId(userId, courseId, completionDate) {
        const data = `${userId}-${courseId}-${completionDate.toISOString()}`;
        const hash = crypto.createHash('sha256').update(data).digest('hex');
        return `IADMA-${hash.substring(0, 12).toUpperCase()}`;
    }

    // Générer le QR code
    async generateQRCode(url) {
        try {
            const qrCodeBuffer = await QRCode.toBuffer(url, {
                type: 'png',
                quality: 0.92,
                margin: 1,
                color: {
                    dark: this.colors.primary,
                    light: '#FFFFFF'
                },
                width: 150
            });
            return qrCodeBuffer;
        } catch (error) {
            console.error('Erreur génération QR code:', error);
            throw error;
        }
    }

    // Créer le PDF du certificat
    async createPDFCertificate(data) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: [this.certificateTemplate.width, this.certificateTemplate.height],
                    margins: this.certificateTemplate.margins
                });

                const buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(buffers);
                    resolve(pdfBuffer);
                });

                // Dessiner le certificat
                this.drawCertificateDesign(doc, data);
                
                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    // Dessiner le design du certificat
    drawCertificateDesign(doc, data) {
        const { width, height } = this.certificateTemplate;
        
        // Background et bordures
        this.drawBackground(doc, width, height);
        
        // Header avec logo IADMA
        this.drawHeader(doc, width);
        
        // Titre principal
        this.drawTitle(doc, width);
        
        // Informations de l'étudiant
        this.drawStudentInfo(doc, data, width);
        
        // Informations du cours
        this.drawCourseInfo(doc, data, width);
        
        // Signatures et validation
        this.drawValidation(doc, data, width, height);
        
        // QR Code et vérification
        this.drawQRCode(doc, data, width, height);
        
        // Footer
        this.drawFooter(doc, width, height);
    }

    // Dessiner le background
    drawBackground(doc, width, height) {
        // Gradient de fond
        doc.rect(0, 0, width, height)
           .fill('#FFFFFF');
           
        // Bordure décorative
        doc.rect(20, 20, width - 40, height - 40)
           .stroke(this.colors.primary, 3);
           
        // Motifs décoratifs dans les coins
        this.drawCornerDecorations(doc, width, height);
    }

    // Dessiner les décorations des coins
    drawCornerDecorations(doc, width, height) {
        const cornerSize = 50;
        
        // Coin supérieur gauche
        doc.save()
           .translate(40, 40)
           .rotate(-45)
           .rect(-cornerSize/2, -cornerSize/2, cornerSize, cornerSize)
           .fill(this.colors.accent, 0.1)
           .restore();
           
        // Coin supérieur droit
        doc.save()
           .translate(width - 40, 40)
           .rotate(45)
           .rect(-cornerSize/2, -cornerSize/2, cornerSize, cornerSize)
           .fill(this.colors.success, 0.1)
           .restore();
    }

    // Dessiner le header
    drawHeader(doc, width) {
        // Logo IADMA (simulé avec du texte stylisé)
        doc.fontSize(24)
           .fillColor(this.colors.primary)
           .font('Helvetica-Bold')
           .text('IADMA', 60, 60);
           
        doc.fontSize(12)
           .fillColor(this.colors.text)
           .font('Helvetica')
           .text('Institut Africain du Digital et des Métiers d\'Avenir', 60, 90);
           
        // Ligne de séparation
        doc.moveTo(60, 120)
           .lineTo(width - 60, 120)
           .stroke(this.colors.primary, 2);
    }

    // Dessiner le titre principal
    drawTitle(doc, width) {
        doc.fontSize(36)
           .fillColor(this.colors.primary)
           .font('Helvetica-Bold')
           .text('CERTIFICAT DE FORMATION', 0, 160, {
               width: width,
               align: 'center'
           });
           
        doc.fontSize(18)
           .fillColor(this.colors.accent)
           .font('Helvetica')
           .text('Formation Professionnelle Certifiante', 0, 200, {
               width: width,
               align: 'center'
           });
    }

    // Dessiner les informations de l'étudiant
    drawStudentInfo(doc, data, width) {
        const centerX = width / 2;
        
        doc.fontSize(16)
           .fillColor(this.colors.text)
           .font('Helvetica')
           .text('Certifie que', 0, 250, {
               width: width,
               align: 'center'
           });
           
        doc.fontSize(28)
           .fillColor(this.colors.primary)
           .font('Helvetica-Bold')
           .text(data.student_name.toUpperCase(), 0, 280, {
               width: width,
               align: 'center'
           });
           
        doc.fontSize(16)
           .fillColor(this.colors.text)
           .font('Helvetica')
           .text('a suivi avec succès la formation', 0, 320, {
               width: width,
               align: 'center'
           });
    }

    // Dessiner les informations du cours
    drawCourseInfo(doc, data, width) {
        doc.fontSize(22)
           .fillColor(this.colors.accent)
           .font('Helvetica-Bold')
           .text(`"${data.course_name}"`, 0, 350, {
               width: width,
               align: 'center'
           });
           
        // Informations détaillées
        const infoY = 390;
        const leftCol = 150;
        const rightCol = width - 250;
        
        // Durée
        doc.fontSize(14)
           .fillColor(this.colors.text)
           .font('Helvetica-Bold')
           .text('Durée de formation:', leftCol, infoY);
        doc.font('Helvetica')
           .text(data.course_duration, leftCol, infoY + 20);
           
        // Date de completion
        doc.font('Helvetica-Bold')
           .text('Date d\'achèvement:', rightCol, infoY);
        doc.font('Helvetica')
           .text(this.formatDate(data.completion_date), rightCol, infoY + 20);
           
        // Note obtenue
        if (data.grade) {
            doc.font('Helvetica-Bold')
               .text('Note obtenue:', leftCol, infoY + 50);
            doc.font('Helvetica')
               .fillColor(this.colors.success)
               .text(`${data.grade}%`, leftCol, infoY + 70);
        }
    }

    // Dessiner la validation
    drawValidation(doc, data, width, height) {
        const validationY = height - 180;
        
        // Signature instructeur
        doc.fontSize(12)
           .fillColor(this.colors.text)
           .font('Helvetica-Bold')
           .text('Formateur certifié:', 100, validationY);
        doc.font('Helvetica')
           .text(data.instructor_name || 'Équipe IADMA', 100, validationY + 20);
           
        // Ligne de signature
        doc.moveTo(100, validationY + 50)
           .lineTo(250, validationY + 50)
           .stroke(this.colors.text, 1);
           
        // Date de délivrance
        doc.font('Helvetica-Bold')
           .text('Délivré le:', width - 250, validationY);
        doc.font('Helvetica')
           .text(this.formatDate(new Date()), width - 250, validationY + 20);
           
        // Sceau officiel (simulé)
        doc.circle(width - 150, validationY + 30, 30)
           .stroke(this.colors.primary, 2);
        doc.fontSize(8)
           .text('SCEAU\nOFFICIEL\nIADMA', width - 165, validationY + 20, {
               width: 30,
               align: 'center'
           });
    }

    // Dessiner le QR code
    drawQRCode(doc, data, width, height) {
        if (data.qr_code) {
            // Position du QR code
            const qrX = width - 120;
            const qrY = 60;
            
            doc.image(data.qr_code, qrX, qrY, {
                width: 80,
                height: 80
            });
            
            doc.fontSize(8)
               .fillColor(this.colors.text)
               .font('Helvetica')
               .text('Vérifiez ce certificat', qrX - 10, qrY + 85, {
                   width: 100,
                   align: 'center'
               });
               
            doc.fontSize(7)
               .text(data.certificate_id, qrX - 10, qrY + 100, {
                   width: 100,
                   align: 'center'
               });
        }
    }

    // Dessiner le footer
    drawFooter(doc, width, height) {
        const footerY = height - 40;
        
        doc.fontSize(8)
           .fillColor(this.colors.text)
           .font('Helvetica')
           .text('Ce certificat est délivré par l\'Institut Africain du Digital et des Métiers d\'Avenir (IADMA)', 0, footerY, {
               width: width,
               align: 'center'
           });
           
        doc.text(`Vérification en ligne: ${process.env.SITE_URL}/verify-certificate`, 0, footerY + 12, {
            width: width,
            align: 'center'
        });
    }

    // Formater une date
    formatDate(date) {
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    // Sauvegarder l'enregistrement du certificat
    async saveCertificateRecord(certificateData) {
        const db = require('./database');
        
        return await db.certificates.create(certificateData);
    }

    // Vérifier un certificat
    async verifyCertificate(certificateId) {
        const db = require('./database');
        
        const certificate = await db.certificates.findOne({
            where: { certificate_id: certificateId },
            include: [
                { model: db.users, as: 'student' },
                { model: db.courses, as: 'course' }
            ]
        });

        if (!certificate) {
            return {
                valid: false,
                error: 'Certificat non trouvé'
            };
        }

        return {
            valid: true,
            certificate: {
                id: certificate.certificate_id,
                student_name: certificate.student_name,
                course_name: certificate.course_name,
                completion_date: certificate.completion_date,
                issued_date: certificate.created_at,
                verification_url: certificate.verification_url
            }
        };
    }

    // Générer un certificat d'inscription (avant completion)
    async generateEnrollmentCertificate(enrollmentData) {
        const {
            user_id,
            course_id,
            student_name,
            course_name,
            enrollment_date
        } = enrollmentData;

        const certificateId = this.generateCertificateId(user_id, course_id, enrollment_date);
        const verificationUrl = `${process.env.SITE_URL}/verify-enrollment/${certificateId}`;
        const qrCodeBuffer = await this.generateQRCode(verificationUrl);

        // PDF simplifié pour l'inscription
        const pdfBuffer = await this.createEnrollmentPDF({
            certificate_id: certificateId,
            student_name,
            course_name,
            enrollment_date,
            qr_code: qrCodeBuffer,
            verification_url: verificationUrl
        });

        return {
            success: true,
            certificate_id: certificateId,
            pdf_buffer: pdfBuffer,
            verification_url: verificationUrl
        };
    }

    // Créer PDF d'inscription
    async createEnrollmentPDF(data) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4' });
                const buffers = [];
                
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => resolve(Buffer.concat(buffers)));

                // Design simplifié pour l'inscription
                doc.fontSize(20)
                   .fillColor(this.colors.primary)
                   .text('IADMA - Confirmation d\'Inscription', 50, 50);
                   
                doc.fontSize(16)
                   .fillColor(this.colors.text)
                   .text(`Étudiant: ${data.student_name}`, 50, 100);
                   
                doc.text(`Formation: ${data.course_name}`, 50, 130);
                doc.text(`Date d'inscription: ${this.formatDate(data.enrollment_date)}`, 50, 160);
                
                if (data.qr_code) {
                    doc.image(data.qr_code, 400, 100, { width: 100 });
                }
                
                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = {
    IADMACertificateGenerator
};

// Exemple d'utilisation
/*
const certificateGenerator = new IADMACertificateGenerator();

// Générer un certificat de completion
const result = await certificateGenerator.generateCertificate({
    student_name: 'Amadou Diallo',
    course_name: 'Compétences digitales de base',
    course_duration: '2 semaines',
    completion_date: new Date(),
    grade: 85,
    instructor_name: 'Dr. Fatou Sow',
    user_id: 123,
    course_id: 'competences_digitales_base'
});

console.log('Certificat généré:', result.certificate_id);
*/
