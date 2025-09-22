// Optimized LLM schemas for faster processing
// Split large schemas into reusable components

const baseResponseSchema = {
    "type": "object",
    "properties": {
        "ai_response_text": {
            "type": "string",
            "description": "The conversational text response to be shown to the user. This should always be populated."
        },
        "action": {
            "type": ["string", "null"],
            "description": "A special action to be performed by the frontend, like 'redirect_to_profile'."
        }
    },
    "required": ["ai_response_text"]
};

const courseSchema = {
    "type": ["object", "null"],
    "description": "Course data. Only populate after consultation is complete.",
    "properties": {
        "title": { "type": "string" },
        "description": { "type": "string" },
        "modules": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": { "type": "string" },
                    "chapters": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "title": { "type": "string" },
                                "description": { "type": "string" },
                                "content": { "type": "string" },
                                "totalDuration": { "type": "number" },
                                "contentType": { "type": "string", "enum": ["article", "video", "audio"] }
                            },
                            "required": ["title", "description", "content", "totalDuration", "contentType"]
                        }
                    }
                },
                "required": ["title", "chapters"]
            }
        }
    },
    "required": ["title", "description", "modules"]
};

const couponSchema = {
    "type": ["object", "null"],
    "description": "Coupon data. Only populate after consultation is complete.",
    "properties": {
        "code": { "type": "string" },
        "startAt": { "type": "string" },
        "validTill": { "type": "string" },
        "type": { "type": "string", "enum": ["creator_discount_coupon", "mango_coupon"] },
        "flatDiscount": { "type": ["number", "null"] },
        "percentageDiscount": { "type": ["number", "null"] },
        "currency": { "type": "string", "enum": ["INR", "USD", "EUR"], "default": "INR" }
    },
    "required": ["code", "startAt", "validTill", "type", "currency"]
};

const postSchema = {
    "type": ["object", "null"],
    "description": "Post data. Only populate after user approves caption.",
    "properties": {
        "caption": { "type": "string" }
    },
    "required": ["caption"]
};

const serviceSchema = {
    "type": ["object", "null"],
    "description": "Service data. Only populate after consultation is complete.",
    "properties": {
        "title": { "type": "string" },
        "description": { "type": "string" },
        "recurringType": { "type": "string", "enum": ["onetime", "monthly", "quarterly", "halfyearly", "yearly"] },
        "price": { "type": "number" },
        "currency": { "type": "string", "enum": ["INR", "USD", "EUR"], "default": "INR" }
    },
    "required": ["title", "description", "recurringType", "price", "currency"]
};

const workshopSchema = {
    "type": ["object", "null"],
    "description": "Workshop data. Only populate after all required fields are collected.",
    "properties": {
        "title": { "type": "string" },
        "description": { "type": "string" },
        "startDate": { "type": "string" },
        "endDate": { "type": "string" },
        "fromTime": { "type": "string" },
        "ongoingCallType": { "type": "string", "enum": ["videocall", "webinar"] },
        "platform": { "type": "string", "enum": ["custom", "webinar", "meeting", "tagmango"] },
        "duration": { "type": "number" },
        "timezone": { "type": "string" },
        "timezoneName": { "type": "string" }
    },
    "required": ["title", "description", "startDate", "endDate", "fromTime", "ongoingCallType", "platform", "duration", "timezone", "timezoneName"]
};

// Optimized schema factory - only include schemas that are likely needed based on context
export const createOptimizedSchema = (context = {}) => {
    const schema = { ...baseResponseSchema };
    
    // Only include course schema when context suggests course creation (not just questions about courses)
    if (context.expectsCourse || context.courseCreationIntent || 
        (context.mentions?.includes('course') && !context.isQuestionAboutExisting)) {
        schema.properties.course_creation_data = courseSchema;
    }
    
    // Add other schemas if context suggests they might be needed
    if (context.expectsCoupon || context.mentions?.includes('coupon') || context.mentions?.includes('discount')) {
        schema.properties.coupon_creation_data = couponSchema;
    }
    
    if (context.expectsPost || context.mentions?.includes('post') || context.mentions?.includes('content')) {
        schema.properties.post_creation_data = postSchema;
    }
    
    if (context.expectsService || context.mentions?.includes('service') || context.mentions?.includes('payment')) {
        schema.properties.service_creation_data = serviceSchema;
    }
    
    if (context.expectsWorkshop || context.mentions?.includes('workshop') || context.mentions?.includes('event')) {
        schema.properties.workshop_creation_data = workshopSchema;
    }
    
    return schema;
};

// Fallback: complete schema for when context is unclear
export const createCompleteSchema = () => ({
    ...baseResponseSchema,
    properties: {
        ...baseResponseSchema.properties,
        course_creation_data: courseSchema,
        coupon_creation_data: couponSchema,
        post_creation_data: postSchema,
        service_creation_data: serviceSchema,
        workshop_creation_data: workshopSchema
    }
});

// Context analyzer to determine what schemas to include
export const analyzeContext = (userMessage, conversationHistory = []) => {
    const message = userMessage.toLowerCase();
    const recentMessages = conversationHistory.slice(-5).map(m => m.text?.toLowerCase() || '').join(' ');
    const fullContext = (message + ' ' + recentMessages).toLowerCase();
    
    // Detect if user is asking questions about existing courses vs wanting to create new ones
    const isQuestionAboutExisting = /(?:what|which|how many|tell me about|explain|describe|show me).*(?:course|module|chapter|lesson)/i.test(message) ||
        /(?:what.*things|what.*are there|what.*contents?|what.*includes?).*(?:in|of).*(?:this|the).*course/i.test(message);
    
    // Detect course creation intent
    const courseCreationIntent = /(?:create|make|build|design|develop|generate|suggest|outline).*(?:course|curriculum|training|program)/i.test(message) ||
        /(?:course|curriculum|training|program).*(?:create|make|build|design|develop|generate|suggest|outline)/i.test(message) ||
        /(?:help me|can you|i want to|i need to).*(?:create|make|build).*course/i.test(message);
    
    return {
        mentions: fullContext.split(/\s+/),
        isQuestionAboutExisting,
        courseCreationIntent,
        expectsCourse: /course|curriculum|lesson|module|teach|learn|training/i.test(fullContext) && !isQuestionAboutExisting,
        expectsCoupon: /coupon|discount|offer|promo|sale/i.test(fullContext),
        expectsPost: /post|content|caption|social|share|publish/i.test(fullContext),
        expectsService: /service|pricing|payment|subscription|membership/i.test(fullContext),
        expectsWorkshop: /workshop|event|session|meeting|webinar|live/i.test(fullContext)
    };
};
