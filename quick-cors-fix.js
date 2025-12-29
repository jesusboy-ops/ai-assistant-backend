// Quick CORS fix for immediate frontend connectivity
// This temporarily allows all origins while we debug

const express = require('express');
const cors = require('cors');

// Create a simple CORS middleware that allows everything temporarily
const allowAllCors = cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['*'],
  exposedHeaders: ['*']
});

console.log('🔧 Quick CORS fix created');
console.log('This allows all origins temporarily for debugging');

module.exports = allowAllCors;