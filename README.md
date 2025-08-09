Here’s a **clean, well-structured `README.md`** that’s ready to drop into your repo:

````markdown
# Grow Baby

Grow Baby is a comprehensive web application designed to help new parents track and manage their baby's health, nutrition, and development in one convenient place.  
Built with a modern tech stack, it leverages the power of AI to provide personalized insights and support.

---

## 🚀 Key Features

- **Personalized Baby Profile** – Create a detailed profile for your baby, including name, date of birth, and gender.  
- **Vaccination Tracker** – A visual, age-based tracker to monitor and manage your baby's vaccination schedule.  
- **Milestone Log** – Easily record and view all of your baby's developmental milestones and special "firsts."  
- **AI-Powered Nutrition Analysis** – Log your baby's food intake and get an instant nutritional breakdown and parenting tips from the **Gemini AI** model.  
- **Weekly Nutrition Summary** – View a weekly summary of your baby's nutrition, complete with data visualizations and an AI-generated summary of trends.  
- **Parenting Resources** – Curated videos and articles tailored to your baby's age, dynamically fetched from popular sources.  
- **AI Chatbot** – A friendly chatbot to answer your general baby care and development questions.

---

## 🛠️ Technology Stack

**Backend:** Node.js, Express.js  
**Frontend:** EJS (Embedded JavaScript Templating)  
**Database:** MongoDB  
**AI Integration:** Google Gemini API (`gemini-2.5-pro` and `gemini-2.0-flash-preview-image-generation`)  
**Other Libraries:**  
- Mongoose  
- yt-search  
- rss-parser  
- Chart.js  
- anime.js  

---

## 📦 Installation

To set up the project locally:

1. **Clone the repository:**
   ```bash
   git clone [your-repository-url]
   cd growbaby
````

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the project root:

   ```env
   GEMINI_API_KEY="your_api_key_here"
   MONGO_URI="mongodb://localhost:27017/growbabyDB"
   ```

4. **Start MongoDB:**
   Ensure your local MongoDB server is running.

5. **Run the application:**

   ```bash
   node app.js
   ```

6. **Access the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💡 Usage Guide

* **Profile Setup:** If no baby profile exists, you'll be redirected to `/profile` to create one.
* **Home Page:** Shows the vaccination tracker.
* **Milestones:** Add and view developmental achievements.
* **Nutrition:** Log food and see AI-generated insights.
* **Resources:** Get curated videos/articles.
* **Chatbot:** Ask questions to the AI assistant.

---

## 🔮 Future Enhancements

* **User Authentication** – Multiple parents & multiple baby profiles.
* **Growth Charts** – Height & weight tracking over time.
* **Reminders & Notifications** – For upcoming vaccinations.
* **Multi-language Support** – For global accessibility.
* **More AI Features** – Sleep schedule recommendations, activity suggestions.

---

## 👥 Team

* Joel Jeggy
* Adarsh Pravi
* Jerry Bernard
* Athil johnson


