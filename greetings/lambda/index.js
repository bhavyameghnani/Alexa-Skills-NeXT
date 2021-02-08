// *****************************************************************************
// Copyright 2020 Amazon.com, Inc. or its affiliates.  All Rights Reserved.

// You may not use this file except in compliance with the terms and conditions
// set forth in the accompanying LICENSE.TXT file.

// THESE MATERIALS ARE PROVIDED ON AN "AS IS" BASIS. AMAZON SPECIFICALLY
// DISCLAIMS, WITH RESPECT TO THESE MATERIALS, ALL WARRANTIES, EXPRESS, IMPLIED,
// OR STATUTORY, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
// *****************************************************************************
'use strict';

const Alexa = require('ask-sdk-core');
const data = require('./greeting.json');
const timeData = require('./time.json');


 const GetTimeAPIHandler = {
    canHandle(handlerInput) {
        console.log('Hello', handlerInput.requestEnvelope.request.apiRequest.name);
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Dialog.API.Invoked'
        && handlerInput.requestEnvelope.request.apiRequest.name === 'getTime';
    },
    handle(handlerInput) {

        const apiRequest = handlerInput.requestEnvelope.request.apiRequest;
        
        let location = resolveEntity(apiRequest.slots, "location");
        console.log('location', location);
        
        const timeResult = {};
        timeResult.location = 'Sorry, I am unable to fetch the location';
        if(null !== location){
            const key = `${location}`;
            const databaseResponse = timeData[key];
            
            timeResult.timeRequired = databaseResponse.timeRequired;
            timeResult.location = apiRequest.arguments.location;
            timeResult.buddy = apiRequest.arguments.buddy;
            console.log('response from GetTimeAPIHandlerHandler ', databaseResponse.timeRequired);
            
        }

        const response = buildSuccessApiResponse(timeResult);
        console.log('GetTimeAPIHandlerHandler', JSON.stringify(response));
        
        return response;
    }
};

const GetRecommendationAPIHandler = {
    
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Dialog.API.Invoked' 
            && handlerInput.requestEnvelope.request.apiRequest.name === 'getRecommendation';
    },
    handle(handlerInput) {
        
        const apiRequest = handlerInput.requestEnvelope.request.apiRequest;
        
        let feeling = resolveEntity(apiRequest.slots, "feeling");
        let confirm = resolveEntity(apiRequest.slots, "confirm");
        
        const recommendationResult = {};
        if (feeling !== null && confirm !== null) {
            const key = `${feeling}-${confirm}`;
            const databaseResponse = data[key];
            
            console.log("Response from mock database ", key);
            console.log("Response from mock database ", databaseResponse);
            console.log("Response from mock database ", databaseResponse.quote);
            
            recommendationResult.quote = databaseResponse.quote;
            recommendationResult.feeling = apiRequest.arguments.feeling
            recommendationResult.confirm = apiRequest.arguments.confirm
        }
        
        const response = buildSuccessApiResponse(recommendationResult);
        console.log('GetRecommendationAPIHandler', JSON.stringify(response));
        
        return response;
    }
};




// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt()
            .getResponse();
    }
};

// *****************************************************************************
// Resolves catalog value using Entity Resolution
const resolveEntity = function(resolvedEntity, slotName) {

    //This is built in functionality with SDK Using Alexa's ER
    let erAuthorityResolution = resolvedEntity[slotName].resolutions 
        .resolutionsPerAuthority[0];
    let value = null;
    
    if (erAuthorityResolution.status.code === 'ER_SUCCESS_MATCH') {
        value = erAuthorityResolution.values[0].value.name;
    }
    
    return value;
};

// *****************************************************************************
// Generic session-ended handling logging the reason received, to help debug in error cases.
// Ends Session if there is an error 
const SessionEndedRequestHandler = { 
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },    
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

// *****************************************************************************
// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = { 
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(JSON.stringify(handlerInput.requestEnvelope.request));
        console.log(`Error handled: ${error.stack}`);
        
        return handlerInput.responseBuilder
        .speak('Sorry, an error occurred.')
        .reprompt('Sorry, an error occurred.')
        .getResponse();
    }
};

// *****************************************************************************
// These simple interceptors just log the incoming and outgoing request bodies to assist in debugging.
const RequestInterceptor = { //Happen before handlers
    process(handlerInput) {
        console.log('RequestInterceptor ', handlerInput.requestEnvelope.request.apiRequest.name);
        console.log('request -', JSON.stringify(handlerInput));
    }
};

// Happens after handlers
const ResponseInterceptor = { 
    process(handlerInput) {
        console.log('ResponseInterceptor ', handlerInput.requestEnvelope.request.apiRequest.name);
        console.log('response -', JSON.stringify(handlerInput.responseBuilder.getResponse()));
    }
};

// Formats JSON for return
// You can use the private SDK methods like "setApiResponse()", but for this template for now, we just send back
// the JSON. General request and response JSON format can be found here:
// https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html
const buildSuccessApiResponse = (returnEntity) => { 
    return { apiResponse: returnEntity };
};

const skillBuilder = Alexa.SkillBuilders.custom();

 exports.handler = skillBuilder
    .addRequestInterceptors(RequestInterceptor)
    .addRequestHandlers(
        GetTimeAPIHandler,
        GetRecommendationAPIHandler,
        IntentReflectorHandler,
        SessionEndedRequestHandler
    )
    .addResponseInterceptors(ResponseInterceptor)
    .addErrorHandlers(ErrorHandler)
    .lambda();