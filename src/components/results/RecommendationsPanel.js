import React from 'react';
import Card from '../common/Card';

const RecommendationsPanel = ({ recommendations }) => {
    return (
        <Card>
            <h3 className="text-lg font-bold text-hud-text-primary mb-4">AI Recommendations</h3>
            <ul className="space-y-3">
                {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 mr-3 text-green-400 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-hud-text-secondary">{rec}</span>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export default RecommendationsPanel;
