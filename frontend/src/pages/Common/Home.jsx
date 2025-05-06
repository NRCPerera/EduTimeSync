import React from 'react'
import { useNavigate } from "react-router-dom";
import Header from '../../components/Header';

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-indigo-600 text-2xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, author }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="text-yellow-400 text-2xl mb-4">⭐⭐⭐⭐⭐</div>
      <p className="text-gray-700 italic mb-4">"{quote}"</p>
      <p className="text-gray-900 font-semibold">– {author}</p>
    </div>
  );
}

const Home = () => {
  const navigate = useNavigate();
  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Effortless Academic Scheduling
              <span className="text-indigo-600"> Made Simple!</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Manage timetables, coordinate examiner availability, and optimize scheduling with AI-powered automation.
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              onClick={() => navigate('/sign-in')}>
                Get Started for Free
              </button>
              <button className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎯"
              title="Smart Scheduling"
              description="AI-powered scheduling that automatically finds the best time slots for everyone."
            />
            <FeatureCard
              icon="🤝"
              title="Seamless Coordination"
              description="Effortlessly coordinate between examiners and students."
            />
            <FeatureCard
              icon="⚡"
              title="Real-Time Availability"
              description="Track and manage availability updates in real-time."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: 1, text: "Admin sets up the modules & events" },
              { step: 2, text: "Examiners submit availability slots" },
              { step: 3, text: "AI auto-assigns examiners & schedules meetings" },
              { step: 4, text: "Students receive notifications & attend presentations" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <p className="text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Users Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <TestimonialCard
              quote="EduTimeSync saved us hours of scheduling work!"
              author="Prof. Smith"
            />
            <TestimonialCard
              quote="A game-changer for examiner coordination!"
              author="Dr. Kumar"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Try EduTimeSync for Free Today!</h2>
          <button className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => navigate('/sign-up')}>
            Sign Up Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">EduTimeSync</h3>
            <p className="text-gray-400">Making academic scheduling effortless.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                🐦
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                💼
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">GitHub</span>
                📚
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
</div>
  );
}

export default Home;