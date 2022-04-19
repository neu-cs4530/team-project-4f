import assert from 'assert';
import { useContext } from 'react';
import FastTravelLocation from '../classes/FastTravelLocation';
import FastTravelLocationContext from '../contexts/FastTravelLocationContext';

/**
 * 
 * 
 */
export default function useFastTravelLocation(): FastTravelLocation[] {
  const ctx = useContext(FastTravelLocationContext);
  assert(ctx, 'FastTravelLocation context should be defined.');
  return ctx;
}
