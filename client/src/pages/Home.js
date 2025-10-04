import React from 'react';
import { Link } from 'react-router-dom';
import SubscriptionForm from '../components/SubscriptionForm';

const Home = () => {
  const features = [
    {
      icon: 'fas fa-database',
      title: 'SQL Mastery',
      description: 'Comprehensive SQL topics from basics to advanced query optimization'
    },
    {
      icon: 'fas fa-brain',
      title: 'Interview Ready',
      description: 'Real interview questions from top tech companies'
    },
    {
      icon: 'fas fa-clock',
      title: 'Daily Updates',
      description: 'Fresh content delivered to your inbox regularly'
    },
    {
      icon: 'fas fa-users',
      title: 'Expert Curated',
      description: 'Content reviewed by database professionals'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer at Google',
      content: 'The SQL tips helped me ace my database design interview!',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9a1c08b?w=64&h=64&fit=crop&crop=face'
    },
    {
      name: 'Mike Johnson',
      role: 'Data Analyst at Microsoft',
      content: 'Perfect balance of theory and practical examples.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
    },
    {
      name: 'Priya Sharma',
      role: 'Database Administrator',
      content: 'The query optimization techniques are game-changers!',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Master SQL Interviews with 
                <span className="text-yellow-300"> Expert Tips</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Join thousands of developers who've landed their dream jobs 
                with our curated SQL newsletter. Get daily tips, practice questions, 
                and interview insights delivered straight to your inbox.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/subscribe"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
                >
                  Start Learning Free
                </Link>
                <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  Watch Demo
                </button>
              </div>

              <div className="mt-8 flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">10K+</div>
                  <div className="text-sm text-blue-200">Active Subscribers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm text-blue-200">SQL Tips Shared</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-sm text-blue-200">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <SubscriptionForm />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose SQL Newsletter?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive approach combines theoretical knowledge with practical 
              application to prepare you for real-world SQL challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center card-hover bg-gray-50 p-8 rounded-xl">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className={`${feature.icon} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Subscribers Say
            </h2>
            <p className="text-xl text-gray-600">
              Join the community of successful SQL professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg card-hover">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                <div className="mt-4 flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star"></i>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Master SQL Interviews?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join our newsletter and start receiving expert SQL tips, 
            practice questions, and interview strategies.
          </p>
          <Link 
            to="/subscribe"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Subscribe Now - It's Free!
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
