import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function DiscoveryQuestionOptions({ question, onAnswer }) {
    const [selectedOptions, setSelectedOptions] = useState([]);

    const handleSingleSelect = (option) => {
        onAnswer(question.key, option);
    };

    const handleMultiSelectToggle = (option) => {
        const updatedSelection = selectedOptions.includes(option)
            ? selectedOptions.filter(item => item !== option)
            : [...selectedOptions, option];
        
        setSelectedOptions(updatedSelection);
    };

    const handleMultiSelectSubmit = () => {
        if (selectedOptions.length > 0) {
            onAnswer(question.key, selectedOptions);
            setSelectedOptions([]);
        }
    };

    if (question.multiSelect) {
        return (
            <div className="space-y-4">
                <div className="space-y-3">
                    {question.options.map((option) => (
                        <div key={option} className="flex items-center space-x-3">
                            <Checkbox
                                id={`${question.key}-${option}`}
                                checked={selectedOptions.includes(option)}
                                onCheckedChange={() => handleMultiSelectToggle(option)}
                                className="border-orange-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                            />
                            <label
                                htmlFor={`${question.key}-${option}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 text-orange-700"
                            >
                                {option}
                            </label>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-orange-200">
                    <span className="text-sm text-orange-600">
                        {selectedOptions.length} selected
                    </span>
                    <Button
                        onClick={handleMultiSelectSubmit}
                        disabled={selectedOptions.length === 0}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        Continue
                    </Button>
                </div>
            </div>
        );
    }

    // Single select options
    return (
        <div className="flex flex-wrap gap-3">
            {question.options.map((option) => (
                <Button
                    key={option}
                    variant="outline"
                    className="bg-white/80 hover:bg-orange-50 border-orange-300 text-orange-700 hover:border-orange-400 transition-all duration-200"
                    onClick={() => handleSingleSelect(option)}
                >
                    {option}
                </Button>
            ))}
        </div>
    );
}