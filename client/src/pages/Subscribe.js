import React from 'react';
import SubscriptionForm from '../components/SubscriptionForm';

const Subscribe = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Weekly SQL tips',
        'Basic interview questions',
        'Community access',
        'Email support'
      ],
      popular: false
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: 'month',
      features: [
        'Daily SQL tips',
        'Advanced interview questions',
        'Query optimization techniques',
        'Database design patterns',
        'Priority support',
        'Exclusive content'
      ],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Learning Path
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start your SQL mastery journey today. Pick the plan that fits your learning goals 
            and interview timeline.
          </p>
        </div>

        {/* Plans Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div key={index} className={`bg-white rounded-2xl shadow-xl p-8 relative ${
              plan.popular ? 'ring-4 ring-blue-500' : ''
            }`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Subscription Form */}
        <div className="flex justify-center">
          <SubscriptionForm />
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="max-w-4xl mx-auto space-y-8">
            {[
              {
                question: "Can I switch from Free to Premium anytime?",
                answer: "Yes! You can upgrade to Premium at any time and get immediate access to all premium features."
              },
              {
                question: "What if I'm not satisfied with Premium?",
                answer: "We offer a 30-day money-back guarantee. If you're not happy, we'll refund your subscription."
              },
              {
                question: "How often do you send newsletters?",
                answer: "Free subscribers receive weekly newsletters, while Premium subscribers get daily tips and insights."
              },
              {
                question: "Do you cover all SQL databases?",
                answer: "Yes, we cover MySQL, PostgreSQL, SQL Server, Oracle, and other major database systems."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
