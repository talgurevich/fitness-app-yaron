// src/app/privacy/page.tsx
'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function PrivacyPolicyPage() {
  const [language, setLanguage] = useState<'he' | 'en'>('he')

  const content = {
    he: {
      title: 'מדיניות פרטיות',
      lastUpdated: 'עדכון אחרון:',
      backToHome: '← חזור לעמוד הבית',
      sections: {
        informationCollected: {
          title: '1. המידע שאנו אוספים',
          provided: {
            title: '1.1 מידע שאתם מספקים',
            list: [
              'שם ופרטי יצירת קשר בעת הזמנת פגישות',
              'כתובת אימייל ומספר טלפון',
              'העדפות פגישות ומידע תיאום',
              'יעדי כושר ומידע בריאותי (כאשר מסופק למאמנים)'
            ]
          },
          google: {
            title: '1.2 מידע מ-Google',
            list: [
              'מידע פרופיל בסיסי (שם, כתובת אימייל, תמונת פרופיל)',
              'גישה ליומן Google (ליצירת פגישות אימון)'
            ]
          },
          automatic: {
            title: '1.3 מידע שנאסף אוטומטית',
            list: [
              'נתוני שימוש ואינטראקציה עם הפלטפורמה שלנו',
              'מידע על המכשיר וכתובת IP',
              'עוגיות וטכנולוגיות מעקב'
            ]
          }
        },
        howWeUse: {
          title: '2. כיצד אנו משתמשים במידע שלכם',
          list: [
            'להקלה על פגישות אימון והזמנות',
            'לאפשר תקשורת בין מאמנים ולקוחות',
            'לשליחת אישורי פגישות ותזכורות',
            'ליצירת אירועי יומן עבור סשנים מתוכננים',
            'לשיפור הפלטפורמה וחוויית המשתמש שלנו',
            'למתן תמיכה ללקוחות',
            'לעמידה בחובות משפטיים'
          ]
        },
        informationSharing: {
          title: '3. שיתוף מידע',
          trainers: {
            title: '3.1 עם מאמנים',
            content: 'כאשר אתם מזמינים פגישה, אנו משתפים את פרטי הקשר שלכם ופרטי הפגישה עם המאמן הרלוונטי כדי להקל על סשן האימון שלכם.'
          },
          serviceProviders: {
            title: '3.2 ספקי שירותים',
            content: 'אנו עשויים לשתף מידע עם ספקי שירות צד שלישי מהימנים שמסייעים לנו בהפעלת הפלטפורמה שלנו, כולל:',
            list: [
              'ספקי שירות אימייל (לאישורי פגישות)',
              'שירותי אירוח ענן',
              'שירותי אינטגרציית יומן'
            ]
          },
          legal: {
            title: '3.3 דרישות משפטיות',
            content: 'אנו עשויים לחשוף את המידע שלכם אם נדרש על פי חוק או כדי להגן על הזכויות, הרכוש או הבטיחות שלנו או של המשתמשים שלנו.'
          }
        },
        dataSecurity: {
          title: '4. אבטחת מידע',
          content: 'אנו מיישמים אמצעי אבטחה טכניים וארגוניים מתאימים כדי להגן על המידע האישי שלכם מפני גישה לא מורשית, שינוי, חשיפה או הרס. זה כולל:',
          list: [
            'הצפנת נתונים במעבר ובמנוחה',
            'הערכות אבטחה רגילות',
            'בקרות גישה ואימות',
            'תשתית ענן מאובטחת'
          ]
        },
        dataRetention: {
          title: '5. שמירת נתונים',
          content: 'אנו שומרים את המידע האישי שלכם כל עוד שהוא נחוץ כדי לספק את השירותים שלנו ולעמוד בחובות משפטיים. באופן ספציפי:',
          list: [
            'מידע חשבון: עד שתמחקו את החשבון שלכם',
            'היסטוריית פגישות: למשך 3 שנים לאחר הפגישה האחרונה',
            'רשומות תקשורת: למשך שנה לאחר האינטראקציה האחרונה'
          ]
        },
        yourRights: {
          title: '6. הזכויות שלכם',
          content: 'יש לכם את הזכות:',
          list: [
            'לגשת למידע האישי שלכם',
            'לתקן מידע לא מדויק או לא שלם',
            'למחוק את החשבון שלכם והנתונים הקשורים',
            'להתנגד לעיבוד המידע שלכם',
            'ניידות נתונים (לקבל עותק של הנתונים שלכם)',
            'לבטל הסכמה לעיבוד נתונים אופציונלי'
          ],
          footer: 'כדי לממש זכויות אלה, אנא צרו איתנו קשר באמצעות המידע המסופק למטה.'
        },
        googleIntegration: {
          title: '7. אינטגרציה עם Google',
          content: 'הפלטפורמה שלנו משתלבת עם שירותי Google כדי לספק פונקציונליות משופרת:',
          list: [
            'Google Sign-In: לאימות מאובטח',
            'Google Calendar: ליצירה וניהול של פגישות אימון'
          ],
          footer: 'השימוש שלכם בשירותי Google כפוף גם למדיניות הפרטיות של Google, שניתן למצוא בכתובת https://policies.google.com/privacy.'
        },
        internationalTransfers: {
          title: '8. העברות נתונים בינלאומיות',
          content: 'המידע שלכם עשוי להיות מועבר ומעובד במדינות אחרות מאשר שלכם. אנו מבטיחים שאמצעי הגנה מתאימים נמצאים במקום כדי להגן על המידע שלכם בהתאם לחוקי הפרטיות החלים.'
        },
        childrensPrivacy: {
          title: '9. פרטיות ילדים',
          content: 'הפלטפורמה שלנו לא מיועדת לילדים מתחת לגיל 13. אנו לא אוספים במודע מידע אישי מילדים מתחת לגיל 13. אם אתם הורה או אפוטרופוס ומאמינים שהילד שלכם סיפק לנו מידע אישי, אנא צרו איתנו קשר.'
        },
        policyChanges: {
          title: '10. שינויים במדיניות פרטיות זו',
          content: 'אנו עשויים לעדכן את מדיניות הפרטיות הזו מעת לעת. אנו נודיע לכם על כל שינוי על ידי פרסום מדיניות הפרטיות החדשה בעמוד זה ועדכון "תאריך עדכון" למעלה. מומלץ לכם לעיין במדיניות פרטיות זו מעת לעת לקבלת עדכונים.'
        },
        contact: {
          title: '11. פרטי יצירת קשר',
          content: 'אם יש לכם שאלות כלשהן לגבי מדיניות הפרטיות הזו או נוהלי הנתונים שלנו, אנא צרו איתנו קשר:',
          info: {
            email: 'אימייל:',
            website: 'אתר:',
            responseTime: 'זמן תגובה:'
          },
          responseTimeText: 'אנו שואפים להגיב לכל פניות הפרטיות תוך 72 שעות.'
        },
        governingLaw: {
          title: '12. חוק שלטון',
          content: 'מדיניות פרטיות זו כפופה ונבנית בהתאם לחוקי הפרטיות החלים. כל מחלוקת הנובעת ממדיניות זו תיפתר בהתאם לתנאי השירות שלנו.'
        }
      },
      footer: 'מדיניות פרטיות זו נכנסה לתוקף ב-{date} ומהווה חלק מהסכם השירות עם Trainer Booking.',
      copyright: '© 2025 טל גורביץ\' • כל הזכויות שמורות'
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated:',
      backToHome: '← Back to Home',
      sections: {
        informationCollected: {
          title: '1. Information We Collect',
          provided: {
            title: '1.1 Information You Provide',
            list: [
              'Name and contact information when booking appointments',
              'Email address and phone number',
              'Appointment preferences and scheduling information',
              'Fitness goals and health information (when provided to trainers)'
            ]
          },
          google: {
            title: '1.2 Information from Google',
            list: [
              'Basic profile information (name, email address, profile picture)',
              'Google Calendar access (to create training appointments)'
            ]
          },
          automatic: {
            title: '1.3 Automatically Collected Information',
            list: [
              'Usage data and interaction with our platform',
              'Device information and IP address',
              'Cookies and tracking technologies'
            ]
          }
        },
        howWeUse: {
          title: '2. How We Use Your Information',
          list: [
            'To facilitate fitness training appointments and bookings',
            'To enable communication between trainers and clients',
            'To send appointment confirmations and reminders',
            'To create calendar events for scheduled sessions',
            'To improve our platform and user experience',
            'To provide customer support',
            'To comply with legal obligations'
          ]
        },
        informationSharing: {
          title: '3. Information Sharing',
          trainers: {
            title: '3.1 With Trainers',
            content: 'When you book an appointment, we share your contact information and appointment details with the relevant trainer to facilitate your training session.'
          },
          serviceProviders: {
            title: '3.2 Service Providers',
            content: 'We may share information with trusted third-party service providers who assist us in operating our platform, including:',
            list: [
              'Email service providers (for appointment confirmations)',
              'Cloud hosting services',
              'Calendar integration services'
            ]
          },
          legal: {
            title: '3.3 Legal Requirements',
            content: 'We may disclose your information if required by law or to protect our rights, property, or safety of our users.'
          }
        },
        dataSecurity: {
          title: '4. Data Security',
          content: 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:',
          list: [
            'Encryption of data in transit and at rest',
            'Regular security assessments',
            'Access controls and authentication',
            'Secure cloud infrastructure'
          ]
        },
        dataRetention: {
          title: '5. Data Retention',
          content: 'We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Specifically:',
          list: [
            'Account information: Until you delete your account',
            'Appointment history: For 3 years after the last appointment',
            'Communication records: For 1 year after the last interaction'
          ]
        },
        yourRights: {
          title: '6. Your Rights',
          content: 'You have the right to:',
          list: [
            'Access your personal information',
            'Correct inaccurate or incomplete information',
            'Delete your account and associated data',
            'Object to processing of your information',
            'Data portability (receive a copy of your data)',
            'Withdraw consent for optional data processing'
          ],
          footer: 'To exercise these rights, please contact us using the information provided below.'
        },
        googleIntegration: {
          title: '7. Google Integration',
          content: 'Our platform integrates with Google services to provide enhanced functionality:',
          list: [
            'Google Sign-In: For secure authentication',
            'Google Calendar: To create and manage training appointments'
          ],
          footer: 'Your use of Google services is also governed by Google\'s Privacy Policy, which can be found at https://policies.google.com/privacy.'
        },
        internationalTransfers: {
          title: '8. International Data Transfers',
          content: 'Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with applicable privacy laws.'
        },
        childrensPrivacy: {
          title: '9. Children\'s Privacy',
          content: 'Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.'
        },
        policyChanges: {
          title: '10. Changes to This Privacy Policy',
          content: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date above. You are advised to review this Privacy Policy periodically for any changes.'
        },
        contact: {
          title: '11. Contact Information',
          content: 'If you have any questions about this Privacy Policy or our data practices, please contact us:',
          info: {
            email: 'Email:',
            website: 'Website:',
            responseTime: 'Response Time:'
          },
          responseTimeText: 'We aim to respond to all privacy inquiries within 72 hours.'
        },
        governingLaw: {
          title: '12. Governing Law',
          content: 'This Privacy Policy is governed by and construed in accordance with applicable privacy laws. Any disputes arising from this policy will be resolved in accordance with our Terms of Service.'
        }
      },
      footer: 'This Privacy Policy became effective on {date} and constitutes part of the service agreement with Trainer Booking.',
      copyright: '© 2025 Tal Gurevich • All rights reserved'
    }
  }

  const currentContent = content[language]

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0f172a', 
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px'
        }}>
          <Link 
            href="/" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              textDecoration: 'none',
              color: 'white'
            }}
          >
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span style={{ fontSize: '18px', fontWeight: '600' }}>
              Trainer Booking
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Language Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setLanguage('he')}
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: '500',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '4px',
                  backgroundColor: language === 'he' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  color: language === 'he' ? '#93c5fd' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                עברית
              </button>
              <button
                onClick={() => setLanguage('en')}
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: '500',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '4px',
                  backgroundColor: language === 'en' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  color: language === 'en' ? '#93c5fd' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                English
              </button>
            </div>

            <Link 
              href="/"
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '6px',
                color: '#93c5fd',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              {currentContent.backToHome}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Title Section */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '700', 
            margin: '0 0 16px 0',
            background: 'linear-gradient(135deg, #ffffff, #e2e8f0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {currentContent.title}
          </h1>
          <p style={{ fontSize: '16px', color: '#94a3b8', margin: 0 }}>
            {currentContent.lastUpdated} {new Date().toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
          </p>
        </div>

        {/* Privacy Content */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.6))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '16px',
          padding: '40px',
          lineHeight: '1.7',
          direction: language === 'he' ? 'rtl' : 'ltr'
        }}>

          {/* Information Collected */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.informationCollected.title}</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 className="subsection-title">{currentContent.sections.informationCollected.provided.title}</h3>
              <ul className="section-list">
                {currentContent.sections.informationCollected.provided.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 className="subsection-title">{currentContent.sections.informationCollected.google.title}</h3>
              <ul className="section-list">
                {currentContent.sections.informationCollected.google.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="subsection-title">{currentContent.sections.informationCollected.automatic.title}</h3>
              <ul className="section-list">
                {currentContent.sections.informationCollected.automatic.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* How We Use */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.howWeUse.title}</h2>
            <ul className="section-list">
              {currentContent.sections.howWeUse.list.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Information Sharing */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.informationSharing.title}</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 className="subsection-title">{currentContent.sections.informationSharing.trainers.title}</h3>
              <p className="section-text">{currentContent.sections.informationSharing.trainers.content}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 className="subsection-title">{currentContent.sections.informationSharing.serviceProviders.title}</h3>
              <p className="section-text">{currentContent.sections.informationSharing.serviceProviders.content}</p>
              <ul className="section-list">
                {currentContent.sections.informationSharing.serviceProviders.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="subsection-title">{currentContent.sections.informationSharing.legal.title}</h3>
              <p className="section-text">{currentContent.sections.informationSharing.legal.content}</p>
            </div>
          </section>

          {/* Data Security */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.dataSecurity.title}</h2>
            <p className="section-text">{currentContent.sections.dataSecurity.content}</p>
            <ul className="section-list">
              {currentContent.sections.dataSecurity.list.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Data Retention */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.dataRetention.title}</h2>
            <p className="section-text">{currentContent.sections.dataRetention.content}</p>
            <ul className="section-list">
              {currentContent.sections.dataRetention.list.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Your Rights */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.yourRights.title}</h2>
            <p className="section-text">{currentContent.sections.yourRights.content}</p>
            <ul className="section-list">
              {currentContent.sections.yourRights.list.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="section-text">{currentContent.sections.yourRights.footer}</p>
          </section>

          {/* Google Integration */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.googleIntegration.title}</h2>
            <p className="section-text">{currentContent.sections.googleIntegration.content}</p>
            <ul className="section-list">
              {currentContent.sections.googleIntegration.list.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="section-text">{currentContent.sections.googleIntegration.footer}</p>
          </section>

          {/* International Transfers */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.internationalTransfers.title}</h2>
            <p className="section-text">{currentContent.sections.internationalTransfers.content}</p>
          </section>

          {/* Children's Privacy */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.childrensPrivacy.title}</h2>
            <p className="section-text">{currentContent.sections.childrensPrivacy.content}</p>
          </section>

          {/* Policy Changes */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.policyChanges.title}</h2>
            <p className="section-text">{currentContent.sections.policyChanges.content}</p>
          </section>

          {/* Contact */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.contact.title}</h2>
            <p className="section-text">{currentContent.sections.contact.content}</p>
            <div className="contact-info">
              <p><strong>{currentContent.sections.contact.info.email}</strong> privacy@trainerbooking.com</p>
              <p><strong>{currentContent.sections.contact.info.website}</strong> https://trainerbooking.com</p>
              <p><strong>{currentContent.sections.contact.info.responseTime}</strong> {currentContent.sections.contact.responseTimeText}</p>
            </div>
          </section>

          {/* Governing Law */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.governingLaw.title}</h2>
            <p className="section-text">{currentContent.sections.governingLaw.content}</p>
          </section>

          <div style={{ 
            borderTop: '1px solid rgba(148, 163, 184, 0.2)', 
            paddingTop: '24px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#94a3b8'
          }}>
            <p>
              {currentContent.footer.replace('{date}', new Date().toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US'))}
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(148, 163, 184, 0.1)',
        padding: '32px 0',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>
              Trainer Booking
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            {currentContent.copyright}
          </p>
        </div>
      </footer>

      {/* Styles */}
      <style jsx>{`
        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #3b82f6;
          margin: 0 0 16px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(59, 130, 246, 0.2);
        }

        .subsection-title {
          font-size: 16px;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0 0 12px 0;
        }

        .section-text {
          font-size: 15px;
          color: #cbd5e1;
          margin: 0 0 16px 0;
          line-height: 1.7;
        }

        .section-list {
          color: #cbd5e1;
          margin: 0 0 16px 0;
          padding-right: ${language === 'he' ? '20px' : '0'};
          padding-left: ${language === 'en' ? '20px' : '0'};
        }

        .section-list li {
          margin-bottom: 8px;
          line-height: 1.6;
        }

        .contact-info {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          padding: 20px;
          margin-top: 16px;
        }

        .contact-info p {
          margin: 0 0 8px 0;
          color: #e2e8f0;
        }

        .contact-info p:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 768px) {
          .section-title {
            font-size: 18px;
          }
          
          .section-text {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  )
}