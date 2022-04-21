import React from 'react';
import FastTravelLocation from '../classes/FastTravelLocation';

/**
 * Hint: You will never need to use this directly. Instead, use the
 * `useConversationAreas` hook.
 */
const Context = React.createContext<FastTravelLocation[]>([]);

export default Context;
