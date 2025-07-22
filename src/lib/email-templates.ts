// src/lib/email-templates.ts

interface BookingEmailData {
  clientName: string
  clientEmail: string
  clientPhone?: string
  trainerName: string
  trainerEmail: string
  datetime: Date
  duration: number
  appointmentId: string
  calendarEventLink?: string
}

export function getClientConfirmationEmail(data: BookingEmailData) {
  const formattedDate = data.datetime.toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const formattedTime = data.datetime.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return {
    to: [data.clientEmail],
    subject: `✅ אישור הזמנה - אימון עם ${data.trainerName}`,
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>אישור הזמנה</title>
      </head>
      <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        
        <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #f3f4f6;">
            <div style="background: #111827; color: white; width: 60px; height: 60px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              🏋️
            </div>
            <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: bold;">הזמנה אושרה בהצלחה!</h1>
            <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 16px;">ההזמנה שלך נשלחה למאמן ותקבל אישור בקרוב</p>
          </div>

          <!-- Booking Details -->
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600;">פרטי האימון</h2>
            
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="background: #ddd6fe; color: #5b21b6; padding: 6px 8px; border-radius: 6px; font-size: 14px; font-weight: 500; min-width: 80px; text-align: center;">📅 תאריך</span>
                <span style="font-weight: 600; color: #111827;">${formattedDate}</span>
              </div>
              
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="background: #ddd6fe; color: #5b21b6; padding: 6px 8px; border-radius: 6px; font-size: 14px; font-weight: 500; min-width: 80px; text-align: center;">⏰ שעה</span>
                <span style="font-weight: 600; color: #111827;">${formattedTime} (${data.duration} דקות)</span>
              </div>
              
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="background: #ddd6fe; color: #5b21b6; padding: 6px 8px; border-radius: 6px; font-size: 14px; font-weight: 500; min-width: 80px; text-align: center;">👨‍💼 מאמן</span>
                <span style="font-weight: 600; color: #111827;">${data.trainerName}</span>
              </div>
              
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="background: #ddd6fe; color: #5b21b6; padding: 6px 8px; border-radius: 6px; font-size: 14px; font-weight: 500; min-width: 80px; text-align: center;">🆔 מספר</span>
                <span style="font-weight: 600; color: #111827; font-family: monospace;">${data.appointmentId.slice(-8)}</span>
              </div>
            </div>
          </div>

          ${data.calendarEventLink ? `
          <!-- Calendar Link -->
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${data.calendarEventLink}" 
               style="background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              📅 פתח ביומן Google
            </a>
          </div>
          ` : ''}

          <!-- Instructions -->
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 8px 0; color: #92400e; font-size: 16px; font-weight: 600;">💡 מה הלאה?</h3>
            <ul style="margin: 0; padding-right: 20px; color: #92400e;">
              <li>המאמן יאשר את ההזמנה בהקדם</li>
              <li>תקבל התראה נוספת לפני האימון</li>
              <li>הגע 5-10 דקות לפני השעה</li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              יש שאלות? צור קשר עם המאמן: 
              <a href="mailto:${data.trainerEmail}" style="color: #2563eb; text-decoration: none;">${data.trainerEmail}</a>
            </p>
            <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
              הזמנה #${data.appointmentId.slice(-8)} • נשלח באמצעות Fitness Booking
            </p>
          </div>

        </div>
      </body>
      </html>
    `
  }
}

export function getTrainerNotificationEmail(data: BookingEmailData) {
  const formattedDate = data.datetime.toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const formattedTime = data.datetime.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return {
    to: [data.trainerEmail],
    subject: `🔔 הזמנה חדשה מ-${data.clientName}`,
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>הזמנה חדשה</title>
      </head>
      <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        
        <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #f3f4f6;">
            <div style="background: #059669; color: white; width: 60px; height: 60px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              🔔
            </div>
            <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: bold;">הזמנה חדשה התקבלה!</h1>
            <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 16px;">לקוח חדש הזמין אימון איתך</p>
          </div>

          <!-- Client Details -->
          <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px 0; color: #065f46; font-size: 18px; font-weight: 600;">פרטי הלקוח</h2>
            
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="background: #10b981; color: white; padding: 6px 8px; border-radius: 6px; font-size: 14px; font-weight: 500; min-width: 80px; text-align: center;">👤 שם</span>
                <span style="font-weight: 600; color: #111827;">${data.clientName}</span>
              </div>
              
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="background: #10b981; color: white; padding: 6px 8px; border-radius: 6px; font-size: 14px; font-weight: 500; min-width: 80px; text-align: center;">📧 אימייל</span>
                <a href="mailto:${data.clientEmail}" style="font-weight: 600; color: #2563eb; text-decoration: none;">${data.clientEmail}</a>
              </div>
              
              ${data.clientPhone ? `
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="background: #10b981; color: white; padding: 6px 8px; border-radius: 6px; font-size: 14px; font-weight: 500; min-width: 80px; text-align: center;">📱 טלפון</span>
                <a href="tel:${data.clientPhone}" style="font-weight: 600; color: #2563eb; text-decoration: none;">${data.clientPhone}</a>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Appointment Details -->
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600;">פרטי האימון</h2>
            
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="background: #6366f1; color: white; padding: 6px 8px; border-radius: 6px; font-size: 14px; font-weight: 500; min-width: 80px; text-align: center;">📅 תאריך</span>
                <span style="font-weight: 600; color: #111827;">${formattedDate}</span>
              </div>
              
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="background: #6366f1; color: white; padding: 6px 8px; border-radius: 6px; font-size: 14px; font-weight: 500; min-width: 80px; text-align: center;">⏰ שעה</span>
                <span style="font-weight: 600; color: #111827;">${formattedTime} (${data.duration} דקות)</span>
              </div>
              
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="background: #6366f1; color: white; padding: 6px 8px; border-radius: 6px; font-size: 14px; font-weight: 500; min-width: 80px; text-align: center;">🆔 מספר</span>
                <span style="font-weight: 600; color: #111827; font-family: monospace;">${data.appointmentId.slice(-8)}</span>
              </div>
            </div>
          </div>

          ${data.calendarEventLink ? `
          <!-- Calendar Link -->
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${data.calendarEventLink}" 
               style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              📅 פתח ביומן Google
            </a>
          </div>
          ` : ''}

          <!-- Action Required -->
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 8px 0; color: #92400e; font-size: 16px; font-weight: 600;">💡 פעולות נדרשות</h3>
            <ul style="margin: 0; padding-right: 20px; color: #92400e;">
              <li>בדוק את הזמינות שלך</li>
              <li>צור קשר עם הלקוח לאישור (אופציונלי)</li>
              <li>האימון נוסף אוטומטית ליומן שלך</li>
            </ul>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              ההזמנה נוספה אוטומטיות ליומן Google שלך
            </p>
            <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
              הזמנה #${data.appointmentId.slice(-8)} • Fitness Booking System
            </p>
          </div>

        </div>
      </body>
      </html>
    `
  }
}