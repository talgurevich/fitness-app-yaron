// src/app/terms/page.tsx
'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function TermsPage() {
  const [language, setLanguage] = useState<'he' | 'en'>('he')

  const content = {
    he: {
      title: 'תנאי השימוש',
      lastUpdated: 'עדכון אחרון:',
      backToHome: '← חזור לעמוד הבית',
      sections: {
        introduction: {
          title: '1. הקדמה',
          content: [
            'ברוכים הבאים ל-Trainer Booking ("השירות", "המערכת", "האפליקציה"). שירות זה מופעל על ידי טל גורביץ\' ("אנחנו", "שלנו"). השירות מיועד למאמני כושר אישיים וללקוחותיהם לניהול הזמנות ותיאום פגישות.',
            'על ידי גישה לשירות או שימוש בו, אתם מסכימים להיות כבולים לתנאי השימוש הללו. אם אינכם מסכימים לחלק כלשהו מהתנאים הללו, אל תשתמשו בשירות.'
          ]
        },
        serviceDescription: {
          title: '2. תיאור השירות',
          content: [
            'Trainer Booking הוא שירות מקוון המאפשר:'
          ],
          list: [
            'למאמני כושר ליצור פרופיל וקישור הזמנה אישי',
            'ללקוחות להזמין פגישות עם המאמנים',
            'סינכרון עם יומן Google של המאמנים',
            'ניהול זמינות ולוח זמנים',
            'מעקב אחר הזמנות ותשלומים',
            'תקשורת בין מאמנים ולקוחות'
          ]
        },
        registration: {
          title: '3. רישום וחשבון משתמש',
          content: [
            'כדי להשתמש בשירות, עליכם:'
          ],
          list: [
            'להירשם עם פרטים אמיתיים ומדויקים',
            'לשמור על סודיות פרטי ההתחברות שלכם',
            'להיות אחראים לכל הפעילות בחשבונכם',
            'להיות בני 18 לפחות או לקבל אישור הורה/אפוטרופוס',
            'לעדכן פרטים אישיים במידת הצורך'
          ],
          footer: 'אתם אחראים לשמירת פרטי ההתחברות שלכם ולכל הפעילות שמתרחשת תחת החשבון שלכם.'
        },
        usage: {
          title: '4. שימוש מותר ואסור',
          allowed: {
            title: 'שימוש מותר:',
            list: [
              'יצירת פרופיל מאמן לגיטימי',
              'הזמנת פגישות עם מאמנים',
              'תקשורת מקצועית עם לקוחות/מאמנים',
              'ניהול לוח זמנים אישי'
            ]
          },
          prohibited: {
            title: 'שימוש אסור:',
            list: [
              'יצירת פרופילים מזויפים או מטעים',
              'ביטול הזמנות באופן חוזר ללא סיבה',
              'הטרדה או התנהגות בלתי הולמת',
              'פגיעה בתפעול המערכת או בביטחון המידע',
              'שימוש במערכת למטרות לא חוקיות',
              'העתקה או שחזור של תכנים מהמערכת'
            ]
          }
        },
        bookingsPayments: {
          title: '5. הזמנות ותשלומים',
          trainers: {
            title: 'עבור מאמנים:',
            list: [
              'המאמן קובע את זמינותו, מחירי השירותים ותנאי הביטול',
              'המאמן אחראי לקיום הפגישות שנקבעו',
              'המאמן יכול לבטל פגישה עם הודעה מוקדמת סבירה'
            ]
          },
          clients: {
            title: 'עבור לקוחות:',
            list: [
              'ההזמנה מתבצעת בכפוף לזמינות המאמן',
              'התשלום מתבצע לפי המחירים שקבע המאמן',
              'ביטול פגישה כפוף למדיניות הביטול של המאמן',
              'הלקוח אחראי להגיע בזמן לפגישה או להודיע על איחור'
            ]
          }
        },
        privacy: {
          title: '6. מדיניות פרטיות ומידע אישי',
          content: [
            'אנו מכבדים את פרטיותכם ומתחייבים להגן על המידע האישי שלכם:'
          ],
          list: [
            'אנו אוספים רק מידע הדרוש לתפעול השירות',
            'המידע משמש לניהול הזמנות וחיבור עם יומן Google',
            'איננו מוכרים או משתפים מידע עם צדדים שלישיים ללא הסכמתכם',
            'אתם יכולים לבקש עדכון או מחיקת המידע שלכם',
            'אנו משתמשים בהצפנה להגנה על המידע'
          ]
        },
        liability: {
          title: '7. אחריות ומגבלות',
          content: [
            'השירות מסופק "כמו שהוא" ו"כפי שזמין". אנו לא מתחייבים:'
          ],
          list: [
            'שהשירות יהיה זמין ללא הפרעה',
            'לאיכות השירותים שמספקים המאמנים',
            'למחלוקות בין מאמנים ולקוחות',
            'לנזקים שנגרמו כתוצאה משימוש בשירות'
          ],
          footer: 'אחריותנו מוגבלת למקסימום של 100 ש"ח או הסכום ששילמתם עבור השירות, הנמוך מביניהם.'
        },
        intellectualProperty: {
          title: '8. זכויות קניין רוחני',
          content: [
            'כל התכנים, העיצוב, הקוד והטכנולוגיה של השירות הם רכושנו הבלעדי או של מעניקי הרישיון שלנו. השימוש בשירות לא מעניק לכם זכויות קניין רוחני כלשהן.'
          ]
        },
        termination: {
          title: '9. הפסקת השירות',
          content: [
            'אנו שומרים לעצמנו את הזכות:'
          ],
          list: [
            'להשעות או לסגור חשבונות שמפרים את התנאים',
            'להפסיק את אספקת השירות בהודעה מוקדמת',
            'לשנות את התנאים בהודעה מוקדמת'
          ],
          footer: 'אתם יכולים לסגור את החשבון שלכם בכל עת דרך הגדרות החשבון או פנייה אלינו.'
        },
        changes: {
          title: '10. שינויים בתנאים',
          content: [
            'אנו רשאים לעדכן את תנאי השימוש מעת לעת. שינויים מהותיים יפורסמו באתר והודעה תישלח למשתמשים רשומים. המשך השימוש בשירות לאחר השינויים מהווה הסכמה לתנאים החדשים.'
          ]
        },
        disputes: {
          title: '11. יישוב סכסוכים',
          content: [
            'בכל מקרה של מחלוקת:'
          ],
          list: [
            'נבקש לפתור את הנושא בדרך של משא ומתן',
            'הדין הישראלי יחול על המחלוקת',
            'בתי המשפט בתל אביב יהיו בעלי הסמכות הבלעדית'
          ]
        },
        contact: {
          title: '12. יצירת קשר',
          content: [
            'לשאלות או הארות בנוגע לתנאי השימוש, ניתן ליצור קשר:'
          ],
          info: {
            email: 'אימייל:',
            creator: 'יוצר המערכת:',
            linkedin: 'LinkedIn:'
          }
        }
      },
      footer: 'תנאי השימוש האלה נכנסו לתוקף ב-{date} ומהווים הסכם משפטי בינכם לבין Trainer Booking.',
      copyright: '© 2025 טל גורביץ\' • כל הזכויות שמורות'
    },
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last updated:',
      backToHome: '← Back to Home',
      sections: {
        introduction: {
          title: '1. Introduction',
          content: [
            'Welcome to Trainer Booking ("the Service", "the System", "the Application"). This service is operated by Tal Gurevich ("we", "our"). The service is designed for personal fitness trainers and their clients to manage appointments and coordinate sessions.',
            'By accessing or using the service, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, then you should not use the service.'
          ]
        },
        serviceDescription: {
          title: '2. Service Description',
          content: [
            'Trainer Booking is an online service that enables:'
          ],
          list: [
            'Fitness trainers to create a profile and personal booking link',
            'Clients to book sessions with trainers',
            'Synchronization with trainers\' Google Calendar',
            'Managing availability and schedules',
            'Tracking bookings and payments',
            'Communication between trainers and clients'
          ]
        },
        registration: {
          title: '3. Registration and User Account',
          content: [
            'To use the service, you must:'
          ],
          list: [
            'Register with true and accurate information',
            'Keep your login credentials confidential',
            'Be responsible for all activity in your account',
            'Be at least 18 years old or have parental/guardian consent',
            'Update personal information as needed'
          ],
          footer: 'You are responsible for safeguarding your login credentials and for all activity that occurs under your account.'
        },
        usage: {
          title: '4. Permitted and Prohibited Use',
          allowed: {
            title: 'Permitted Use:',
            list: [
              'Creating a legitimate trainer profile',
              'Booking sessions with trainers',
              'Professional communication with clients/trainers',
              'Managing personal schedules'
            ]
          },
          prohibited: {
            title: 'Prohibited Use:',
            list: [
              'Creating fake or misleading profiles',
              'Repeatedly canceling bookings without reason',
              'Harassment or inappropriate behavior',
              'Damaging system operation or information security',
              'Using the system for illegal purposes',
              'Copying or reproducing content from the system'
            ]
          }
        },
        bookingsPayments: {
          title: '5. Bookings and Payments',
          trainers: {
            title: 'For Trainers:',
            list: [
              'The trainer sets their availability, service prices, and cancellation terms',
              'The trainer is responsible for attending scheduled sessions',
              'The trainer may cancel a session with reasonable advance notice'
            ]
          },
          clients: {
            title: 'For Clients:',
            list: [
              'Booking is subject to trainer availability',
              'Payment is made according to prices set by the trainer',
              'Session cancellation is subject to the trainer\'s cancellation policy',
              'The client is responsible for arriving on time or notifying of delays'
            ]
          }
        },
        privacy: {
          title: '6. Privacy Policy and Personal Information',
          content: [
            'We respect your privacy and are committed to protecting your personal information:'
          ],
          list: [
            'We collect only information necessary for service operation',
            'Information is used for managing bookings and Google Calendar integration',
            'We do not sell or share information with third parties without your consent',
            'You can request updates or deletion of your information',
            'We use encryption to protect information'
          ]
        },
        liability: {
          title: '7. Liability and Limitations',
          content: [
            'The service is provided "as is" and "as available". We do not guarantee:'
          ],
          list: [
            'That the service will be available without interruption',
            'The quality of services provided by trainers',
            'Disputes between trainers and clients',
            'Damages resulting from use of the service'
          ],
          footer: 'Our liability is limited to a maximum of $25 USD or the amount you paid for the service, whichever is lower.'
        },
        intellectualProperty: {
          title: '8. Intellectual Property Rights',
          content: [
            'All content, design, code, and technology of the service are our exclusive property or that of our licensors. Use of the service does not grant you any intellectual property rights.'
          ]
        },
        termination: {
          title: '9. Service Termination',
          content: [
            'We reserve the right to:'
          ],
          list: [
            'Suspend or close accounts that violate the terms',
            'Discontinue service provision with advance notice',
            'Change terms with advance notice'
          ],
          footer: 'You may close your account at any time through account settings or by contacting us.'
        },
        changes: {
          title: '10. Changes to Terms',
          content: [
            'We may update these Terms of Service from time to time. Material changes will be posted on the website and notification will be sent to registered users. Continued use of the service after changes constitutes agreement to the new terms.'
          ]
        },
        disputes: {
          title: '11. Dispute Resolution',
          content: [
            'In case of any dispute:'
          ],
          list: [
            'We will seek to resolve the matter through negotiation',
            'Israeli law will govern the dispute',
            'Tel Aviv courts will have exclusive jurisdiction'
          ]
        },
        contact: {
          title: '12. Contact',
          content: [
            'For questions or comments regarding these Terms of Service, please contact:'
          ],
          info: {
            email: 'Email:',
            creator: 'System Creator:',
            linkedin: 'LinkedIn:'
          }
        }
      },
      footer: 'These Terms of Service became effective on {date} and constitute a legal agreement between you and Trainer Booking.',
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

        {/* Terms Content */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.6))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '16px',
          padding: '40px',
          lineHeight: '1.7',
          direction: language === 'he' ? 'rtl' : 'ltr'
        }}>

          {/* Introduction */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.introduction.title}</h2>
            {currentContent.sections.introduction.content.map((paragraph, index) => (
              <p key={index} className="section-text">{paragraph}</p>
            ))}
          </section>

          {/* Service Description */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.serviceDescription.title}</h2>
            {currentContent.sections.serviceDescription.content.map((paragraph, index) => (
              <p key={index} className="section-text">{paragraph}</p>
            ))}
            <ul className="section-list">
              {currentContent.sections.serviceDescription.list.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Registration */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.registration.title}</h2>
            {currentContent.sections.registration.content.map((paragraph, index) => (
              <p key={index} className="section-text">{paragraph}</p>
            ))}
            <ul className="section-list">
              {currentContent.sections.registration.list.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="section-text">{currentContent.sections.registration.footer}</p>
          </section>

          {/* Usage */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.usage.title}</h2>
            <div style={{ marginBottom: '24px' }}>
              <h3 className="subsection-title">{currentContent.sections.usage.allowed.title}</h3>
              <ul className="section-list">
                {currentContent.sections.usage.allowed.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="subsection-title">{currentContent.sections.usage.prohibited.title}</h3>
              <ul className="section-list">
                {currentContent.sections.usage.prohibited.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Bookings and Payments */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.bookingsPayments.title}</h2>
            <p className="section-text">
              <strong>{currentContent.sections.bookingsPayments.trainers.title}</strong>
            </p>
            <ul className="section-list">
              {currentContent.sections.bookingsPayments.trainers.list.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="section-text">
              <strong>{currentContent.sections.bookingsPayments.clients.title}</strong>
            </p>
            <ul className="section-list">
              {currentContent.sections.bookingsPayments.clients.list.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Privacy */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.privacy.title}</h2>
            {currentContent.sections.privacy.content.map((paragraph, index) => (
              <p key={index} className="section-text">{paragraph}</p>
            ))}
            <ul className="section-list">
              {currentContent.sections.privacy.list.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Liability */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.liability.title}</h2>
            {currentContent.sections.liability.content.map((paragraph, index) => (
              <p key={index} className="section-text">{paragraph}</p>
            ))}
            <ul className="section-list">
              {currentContent.sections.liability.list.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="section-text">{currentContent.sections.liability.footer}</p>
          </section>

          {/* Intellectual Property */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.intellectualProperty.title}</h2>
            {currentContent.sections.intellectualProperty.content.map((paragraph, index) => (
              <p key={index} className="section-text">{paragraph}</p>
            ))}
          </section>

          {/* Termination */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.termination.title}</h2>
            {currentContent.sections.termination.content.map((paragraph, index) => (
              <p key={index} className="section-text">{paragraph}</p>
            ))}
            <ul className="section-list">
              {currentContent.sections.termination.list.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="section-text">{currentContent.sections.termination.footer}</p>
          </section>

          {/* Changes */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.changes.title}</h2>
            {currentContent.sections.changes.content.map((paragraph, index) => (
              <p key={index} className="section-text">{paragraph}</p>
            ))}
          </section>

          {/* Disputes */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.disputes.title}</h2>
            {currentContent.sections.disputes.content.map((paragraph, index) => (
              <p key={index} className="section-text">{paragraph}</p>
            ))}
            <ul className="section-list">
              {currentContent.sections.disputes.list.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Contact */}
          <section style={{ marginBottom: '32px' }}>
            <h2 className="section-title">{currentContent.sections.contact.title}</h2>
            {currentContent.sections.contact.content.map((paragraph, index) => (
              <p key={index} className="section-text">{paragraph}</p>
            ))}
            <div className="contact-info">
              <p><strong>{currentContent.sections.contact.info.email}</strong> support@trainerbooking.com</p>
              <p><strong>{currentContent.sections.contact.info.creator}</strong> {language === 'he' ? 'טל גורביץ\'' : 'Tal Gurevich'}</p>
              <p><strong>{currentContent.sections.contact.info.linkedin}</strong>
                <a 
                  href="https://www.linkedin.com/in/talgurevich/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#3b82f6', textDecoration: 'none', marginLeft: '8px' }}
                >
                  linkedin.com/in/talgurevich
                </a>
              </p>
            </div>
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