'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        backgroundColor: 'black', 
        color: 'white', 
        overflow: 'hidden',
        padding: '6rem 1rem'
      }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '3.75rem', 
            fontWeight: 'bold', 
            marginBottom: '2rem', 
            lineHeight: '1.2' 
          }}>
            מערכת הזמנות מתקדמת
            <br />
            <span style={{ color: '#d1d5db' }}>למאמני כושר</span>
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            marginBottom: '3rem', 
            color: '#d1d5db',
            maxWidth: '48rem',
            margin: '0 auto 3rem auto',
            lineHeight: '1.6'
          }}>
            פלטפורמה מקצועית לניהול הזמנות עם חיבור ליומן Google ומעקב אחר לקוחות.
            הפכו את ניהול האימונים שלכם לפשוט ויעיל יותר מתמיד.
          </p>
          
          {/* Fixed Button Container */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '2rem',
            flexWrap: 'wrap',
            marginTop: '2rem'
          }}>
            <Link
              href="/login"
              style={{
                backgroundColor: 'white',
                color: 'black',
                fontWeight: 'bold',
                padding: '1rem 3rem',
                fontSize: '1.125rem',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                display: 'inline-block'
              }}
              className="hover-button"
            >
              התחברות למאמנים
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '6rem 1rem', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold', 
              color: 'black', 
              marginBottom: '1.5rem' 
            }}>
              למה לבחור במערכת שלנו?
            </h2>
            <div style={{ 
              width: '6rem', 
              height: '0.25rem', 
              backgroundColor: 'black', 
              margin: '0 auto 1.5rem auto' 
            }}></div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '3rem' 
          }}>
            {/* Feature 1 */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '3rem', 
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{ 
                width: '5rem', 
                height: '5rem', 
                backgroundColor: 'black', 
                color: 'white', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 2rem auto',
                fontSize: '2.5rem'
              }}>
                📅
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                marginBottom: '1.5rem', 
                color: 'black' 
              }}>
                חיבור ליומן Google
              </h3>
              <p style={{ 
                color: '#4b5563', 
                lineHeight: '1.6', 
                fontSize: '1.125rem' 
              }}>
                סנכרון אוטומטי עם יומן Google שלכם. כל הזמנה חדשה תופיע מיד ביומן הפרטי שלכם עם כל הפרטים הרלוונטיים.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '3rem', 
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{ 
                width: '5rem', 
                height: '5rem', 
                backgroundColor: 'black', 
                color: 'white', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 2rem auto',
                fontSize: '2.5rem'
              }}>
                🔗
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                marginBottom: '1.5rem', 
                color: 'black' 
              }}>
                קישור הזמנה אישי
              </h3>
              <p style={{ 
                color: '#4b5563', 
                lineHeight: '1.6', 
                fontSize: '1.125rem' 
              }}>
                כל מאמן מקבל קישור אישי ויוניק. שתפו אותו עם הלקוחות שלכם והם יוכלו להזמין פגישות ישירות ללא צורך ברישום.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '3rem', 
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{ 
                width: '5rem', 
                height: '5rem', 
                backgroundColor: 'black', 
                color: 'white', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 2rem auto',
                fontSize: '2.5rem'
              }}>
                📊
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                marginBottom: '1.5rem', 
                color: 'black' 
              }}>
                ניהול מתקדם
              </h3>
              <p style={{ 
                color: '#4b5563', 
                lineHeight: '1.6', 
                fontSize: '1.125rem' 
              }}>
                לוח בקרה מקצועי עם מעקב אחר כל ההזמנות, פרטי לקוחות, וניהול זמינות. הכל במקום אחד ונגיש.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA Section */}
      <section style={{ 
        padding: '6rem 1rem', 
        backgroundColor: 'black', 
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: '2rem' 
          }}>
            התחילו עוד היום!
          </h2>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#d1d5db', 
            marginBottom: '3rem',
            lineHeight: '1.6'
          }}>
            הצטרפו למאמנים רבים שכבר משתמשים במערכת ומנהלים את העסק שלהם ביעילות מקסימלית
          </p>
          <Link
            href="/login"
            style={{
              backgroundColor: 'white',
              color: 'black',
              fontWeight: 'bold',
              padding: '1rem 2rem',
              fontSize: '1.125rem',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              display: 'inline-block',
              transition: 'all 0.3s ease'
            }}
          >
            הצטרפו עכשיו - בחינם
          </Link>
        </div>
      </section>

      <style jsx>{`
        .hover-button:hover {
          background-color: #f3f4f6;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  )
}