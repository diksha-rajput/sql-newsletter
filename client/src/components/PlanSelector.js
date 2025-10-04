import React from 'react';

const PlanSelector = ({ selectedPlan, onPlanSelect }) => {
  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: '$0',
      period: 'forever',
      features: [
        'Weekly SQL tips',
        'Basic interview questions',
        'Community access',
        'Email support'
      ],
      color: 'gray'
    },
    {
      id: 'paid',
      name: 'Premium Plan', 
      price: '$9.99',
      period: 'month',
      features: [
        'Daily SQL tips',
        'Advanced interview questions',
        'Query optimization guides',
        'Database design patterns',
        'Priority support',
        'Exclusive content'
      ],
      color: 'blue',
      popular: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {plans.map((plan) => (
        <div
          key={plan.id}
          onClick={() => onPlanSelect(plan.id)}
          className={`cursor-pointer rounded-lg p-6 border-2 transition-all duration-200 ${
            selectedPlan === plan.id
              ? `border-${plan.color}-500 bg-${plan.color}-50`
              : 'border-gray-200 hover:border-gray-300'
          } ${plan.popular ? 'relative' : ''}`}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Most Popular
              </span>
            </div>
          )}

          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-gray-600">/{plan.period}</span>
            </div>
          </div>

          <ul className="space-y-2 mb-6">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm">
                <i className="fas fa-check text-green-500 mr-2"></i>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="text-center">
            <div className={`w-4 h-4 rounded-full border-2 mx-auto ${
              selectedPlan === plan.id
                ? `bg-${plan.color}-500 border-${plan.color}-500`
                : 'border-gray-300'
            }`}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlanSelector;
