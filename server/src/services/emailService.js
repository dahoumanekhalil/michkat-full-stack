// src/services/emailService.js

/**
 * خدمة إرسال البريد الإلكتروني
 * في الوضع التطويري: نحفظ الرابط في Console
 * في الإنتاج: استخدم nodemailer أو خدمة خارجية
 */

class EmailService {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
  }

  /**
   * إرسال بريد إلكتروني لإعادة تعيين كلمة المرور
   */
  async sendPasswordResetEmail(email, resetToken, userName) {
    const resetURL = `${this.clientURL}/reset-password?token=${resetToken}`;
    
    // في وضع التطوير، نطبع الرابط في Console
    if (this.isDevelopment) {
      console.log('\n' + '='.repeat(80));
      console.log('📧 Password Reset Email (Development Mode)');
      console.log('='.repeat(80));
      console.log(`To: ${email}`);
      console.log(`User: ${userName}`);
      console.log(`Reset Link: ${resetURL}`);
      console.log(`Token: ${resetToken}`);
      console.log('='.repeat(80) + '\n');
      
      return {
        success: true,
        message: 'تم إرسال رابط إعادة التعيين (Development Mode)',
        resetURL, // للتطوير فقط
      };
    }

    // في الإنتاج، استخدم خدمة بريد إلكتروني حقيقية
    try {
      // TODO: استبدل هذا بخدمة بريد إلكتروني حقيقية
      // مثال: SendGrid, AWS SES, Nodemailer, إلخ
      
      /*
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"مشكاة" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: 'إعادة تعيين كلمة المرور - مشكاة',
        html: this.getPasswordResetEmailTemplate(userName, resetURL),
      };

      await transporter.sendMail(mailOptions);
      */

      return {
        success: true,
        message: 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني',
      };
    } catch (error) {
      console.error('Email send error:', error);
      throw new Error('فشل إرسال البريد الإلكتروني');
    }
  }

  /**
   * إرسال بريد إلكتروني للتحقق
   */
  async sendVerificationEmail(email, verificationToken, userName) {
    const verificationURL = `${this.clientURL}/verify-email?token=${verificationToken}`;
    
    if (this.isDevelopment) {
      console.log('\n' + '='.repeat(80));
      console.log('📧 Email Verification (Development Mode)');
      console.log('='.repeat(80));
      console.log(`To: ${email}`);
      console.log(`User: ${userName}`);
      console.log(`Verification Link: ${verificationURL}`);
      console.log(`Token: ${verificationToken}`);
      console.log('='.repeat(80) + '\n');
      
      return {
        success: true,
        message: 'تم إرسال رابط التحقق (Development Mode)',
        verificationURL,
      };
    }

    // في الإنتاج، استخدم خدمة بريد إلكتروني حقيقية
    try {
      // TODO: Implement real email sending
      return {
        success: true,
        message: 'تم إرسال رابط التحقق إلى بريدك الإلكتروني',
      };
    } catch (error) {
      console.error('Email send error:', error);
      throw new Error('فشل إرسال البريد الإلكتروني');
    }
  }

  /**
   * قالب HTML لبريد إعادة تعيين كلمة المرور
   */
  getPasswordResetEmailTemplate(userName, resetURL) {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>إعادة تعيين كلمة المرور</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">مشكاة</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">إعادة تعيين كلمة المرور</p>
          </div>

          <!-- Body -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin-top: 0;">مرحباً ${userName}،</h2>
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. إذا لم تقم بهذا الطلب، يمكنك تجاهل هذا البريد.
            </p>
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              لإعادة تعيين كلمة المرور، اضغط على الزر أدناه:
            </p>

            <!-- Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetURL}" 
                 style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                إعادة تعيين كلمة المرور
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              أو انسخ الرابط التالي والصقه في المتصفح:
            </p>
            <p style="color: #3b82f6; font-size: 14px; word-break: break-all; background-color: #f3f4f6; padding: 15px; border-radius: 5px; direction: ltr; text-align: left;">
              ${resetURL}
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #ef4444; font-size: 14px; font-weight: bold;">⚠️ تنبيه أمني:</p>
              <ul style="color: #6b7280; font-size: 14px; line-height: 1.8;">
                <li>هذا الرابط صالح لمدة ساعة واحدة فقط</li>
                <li>لا تشارك هذا الرابط مع أي شخص</li>
                <li>إذا لم تطلب إعادة تعيين كلمة المرور، قم بتغييرها فوراً</li>
              </ul>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} مشكاة. جميع الحقوق محفوظة.
            </p>
            <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0 0;">
              هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * قالب HTML لبريد التحقق
   */
  getVerificationEmailTemplate(userName, verificationURL) {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تأكيد البريد الإلكتروني</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; padding: 40px;">
          <h1 style="color: #10b981;">مرحباً ${userName}!</h1>
          <p>شكراً لتسجيلك في مشكاة. يرجى تأكيد بريدك الإلكتروني بالضغط على الزر أدناه:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationURL}" style="background-color: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block;">
              تأكيد البريد الإلكتروني
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">أو انسخ الرابط: ${verificationURL}</p>
        </div>
      </body>
      </html>
    `;
  }
}

// إنشاء نسخة واحدة
const emailService = new EmailService();

module.exports = emailService;