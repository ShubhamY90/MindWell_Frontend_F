# 🧠 MindWell – Because Your Mind Deserves Kindness

Welcome to **MindWell**, a comprehensive mental wellness platform designed to provide compassionate, evidence-based support through modern technology. This README guides you through the project structure, features, and technical details to help you understand the full scope of the application without needing to open individual files.
<img width="700" height="383" alt="Screenshot 2025-09-19 at 11 38 31 PM" src="https://github.com/user-attachments/assets/e3656a36-cd6e-49c6-a96a-25603c53590f" />

---

## 📌 Project Overview

MindWell is a digital companion for mental health, offering:

- **Mood Testing:** Clinically validated mood assessments with AI-driven insights.
- **AI Chatbot:** A Gemini AI-powered chatbot providing empathetic, 24/7 conversational support.
- **Community Network:** A moderated, supportive social space for sharing and connection.
- **Personalized Resources:** Evidence-based tools, articles, and videos tailored to user moods.
- **Professional Help:** Easy connection to psychiatrists and mental health professionals.
<img width="700" height="383" alt="Screenshot 2025-09-19 at 11 48 37 PM" src="https://github.com/user-attachments/assets/2d881b73-09ed-4fdd-bca9-6994c38e4bef" />

---

## 🗂️ Project Structure

- **src/**: Core application logic, routing, hooks, and utilities.
- **components/**: Reusable UI components for chatbot, community, and general interface.
- **pages/**: Individual page components for different app sections.
- **context/firebase/**: Firebase configuration and authentication.
- **public/**: Static assets and configuration files.

---

## 📄 Pages & Their Functions

### Core User Pages
- **Home (`/`)**: Entry point with mood assessment, quick access to AI chat, community, and professional help. Solves initial user engagement and navigation. Use it to start your mental wellness journey.
- **Test (`/test`)**: Interactive mood questionnaire with AI interpretation. Solves self-assessment needs. Use it to gain insights into your current emotional state.
- <img width="700" height="383" alt="Screenshot 2025-09-19 at 11 51 13 PM" src="https://github.com/user-attachments/assets/a8b23ced-77c9-4ca0-8bdc-a05749811428" />

- <img width="700" height="383" alt="image" src="https://github.com/user-attachments/assets/5831f21a-dbbb-45ac-b7ca-aad7e0907ef5" />

- **Chatbot (`/chatbot`)**: 24/7 AI conversational support with encrypted sessions. Solves immediate emotional support needs. Use it for confidential, judgment-free conversations.
- <img width="700" height="383" alt="Screenshot 2025-09-19 at 11 46 17 PM" src="https://github.com/user-attachments/assets/debccf8c-1d2d-4d1e-9fee-3409a33ce3e9" />

- <img width="700" height="383" alt="Screenshot 2025-09-19 at 11 46 34 PM" src="https://github.com/user-attachments/assets/450893ef-a431-4fad-84a2-0f042689e315" />

- **Community (`/community`)**: Moderated social space for anonymous/open sharing. Solves isolation and connection needs. Use it to find support and share experiences safely.
- <img width="1440" height="777" alt="image" src="https://github.com/user-attachments/assets/4ba0a175-24b1-434e-ae46-284bb0276544" />

  
- **Resources (`/resources`, `/wellnessresources`)**: Personalized mental health tools and articles. Solves education and coping strategy needs. Use it for evidence-based self-help resources.
- <img width="700" height="383" alt="Screenshot 2025-09-19 at 11 44 27 PM" src="https://github.com/user-attachments/assets/588f80a1-1a58-47ea-8afc-6a61c3d8e586" />
- <img width="700" height="383" alt="Screenshot 2025-09-19 at 11 45 12 PM" src="https://github.com/user-attachments/assets/bba1f4c8-64f1-4278-9101-4a0ad9695028" />


### Authentication & Role-Based Pages
- **Auth (`/auth`)**: Student user login/registration. Solves secure access for students.
- <img width="700" height="383" alt="Screenshot 2025-09-19 at 11 56 11 PM" src="https://github.com/user-attachments/assets/e09afb4b-3bc8-4d10-94b2-e44a0d688994" />

- **PsychiatristAuth (`/psychiatrist-auth`)**: Professional healthcare provider login. Solves secure access for mental health professionals.
- <img width="700" height="383" alt="Screenshot 2025-09-19 at 11 56 33 PM" src="https://github.com/user-attachments/assets/edf8b5f9-ef9a-4b6b-b7eb-bbfba22e6b09" />

- **AdminAuth (`/admin-auth`)**: Administrative access for platform management. Solves oversight and moderation needs.
- <img width="700" height="383" alt="Screenshot 2025-09-19 at 11 44 13 PM" src="https://github.com/user-attachments/assets/19345063-ac7a-4bb5-bfcb-5628daaefbea" />


### Professional & Administrative Pages
- **PsychiatristDashboard (`/psychiatrist`)**: Protected dashboard for managing consultations. Solves professional-patient interaction needs.
- <img width="700" height="383" alt="Screenshot 2025-09-20 at 12 00 43 AM" src="https://github.com/user-attachments/assets/010426bb-36c8-4b04-bc31-4ef86ed5936d" />

- **PsychiatristRegister (`/psychiatrist-register`)**: Registration for mental health professionals. Solves credential verification.
- **AddRequest (`/add-request`)**: Students request professional consultations. Solves access to professional help.
- <img width="700" height="383" alt="Screenshot 2025-09-19 at 11 47 18 PM" src="https://github.com/user-attachments/assets/95f25b16-de00-481e-ac5c-e7eaaff93ac9" />

- **MyChats (`/my-chats`)**: User chat history and session management. Solves continuity of AI conversations.
- <img width="700" height="383" alt="image" src="https://github.com/user-attachments/assets/967c3150-3b9b-4e6d-adbc-40c0dde982d0" />

- **ViewRequests (`/view-requests`)**: Admin review of consultation requests. Solves request triage and assignment.
- **AdminReportsPage (`/admin-reports`)**: Platform moderation and reporting tools. Solves community safety and compliance.
- <img width="700" height="383" alt="image" src="https://github.com/user-attachments/assets/847d735a-3889-44f1-be7a-e616fe7933c4" />
- <img width="700" height="383" alt="Screenshot 2025-09-20 at 12 13 51 AM" src="https://github.com/user-attachments/assets/7f3fd6ac-1302-421f-948a-7a1c5f2d899c" />




### Legal & Policy Pages
- **TermsOfService, PrivacyPolicy, CookiePolicy**: Legal compliance and user rights information. Solves transparency and legal requirements.

---

## ⚙️ Technology Stack

- **Frontend:** React.js with React Router, Tailwind CSS for styling, Framer Motion for animations.
- **Backend:** Node.js with Express.js (API endpoints not shown here but implied).
- **Authentication & Database:** Firebase Authentication and Firestore.
- **AI Integration:** Gemini API for chatbot intelligence.
- **Utilities:** Lodash, Lucide React icons, React Markdown, React Responsive Carousel, Recharts for charts.
- **Build Tools:** Vite for fast development and build.

---

## 🚀 Features & User Flow

1. **User Authentication:** Supports students, psychiatrists, and admins with role-based protected routes.
2. **Mood Test:** Interactive mood questionnaire with AI interpretation.
3. **AI Chatbot:** 24/7 conversational AI assistant with session history and encrypted chat.
4. **Community Hive:** Anonymous or open posting with moderation.
5. **Resource Library:** Personalized mental health resources.
6. **Professional Connection:** Request and manage psychiatrist consultations.
7. **Admin Tools:** View and manage user requests and reports.

---

## 📦 Installation & Running Locally

```bash
# Clone the repo
git clone https://github.com/Abhishek-kroy/Mindwell_Frontend
cd MindWell

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the app.

---

## 🧩 How to Navigate the Codebase

- Start with `src/App.jsx` to understand routing and authentication.
- Explore `pages/` for UI screens and user flows.
- Dive into `components/Chatbot/` for chatbot UI and logic.
- Check `context/firebase/` for Firebase setup.
- Use `utils/` for helper functions and API calls.

---

## 🔒 Security & Moderation

- **Data Encryption:** Chat sessions and sensitive user data are encrypted using AES-GCM (Advanced Encryption Standard with Galois/Counter Mode) with PBKDF2 key derivation for maximum security and privacy.
- **Community Moderation:** Dual-layer moderation system - automatic AI screening for toxic content before posting, plus user reporting system for spam, hate speech, harassment, and false information.
- **Role-Based Access:** Protected routes ensure users only access appropriate features based on their roles (student, psychiatrist, admin).
- **Firebase Security:** Authentication and database operations follow Firebase security best practices with secure token management.

## 📜 Additional Notes

- The project uses environment variables for Firebase config (see `.env` file).
- Chat sessions are encrypted and stored securely.
- The AI chatbot uses Gemini API for empathetic responses.
- Tailwind CSS ensures responsive and accessible UI.

---

## 🧑‍💻 Contributors

- Developed with care by a dedicated team passionate about mental health and technology.

- [@Abhishek Kumar Roy](https://github.com/Abhishek-kroy)
- [@shubham Yadav](https://github.com/ShubhamY90)
- [@Surveer](https://github.com/surveerssg)
- [@Aryan Mahajan](https://github.com/AryanM65)
- [@Shubhangi](https://github.com/SHUBHANGIjohri)


---

This README aims to provide a clear, concise, and comprehensive guide to the MindWell project for judges and reviewers. For any questions or further details, please refer to the source code or contact the development team.
