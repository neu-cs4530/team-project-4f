import { Box, Heading, ListItem, UnorderedList, Button } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import FastTravelLocation from '../../classes/FastTravelLocation';
import useFastTravelLocation from '../../hooks/useFastTravelLocation';


/** 
 * 
 */

export default function FTLList(): JSX.Element {
    const FTLs = useFastTravelLocation();
    
    return (
      <Box>
        <Heading as='h2' fontSize='l'>Fast Travel Locations:</Heading>
        <UnorderedList>
          {FTLs.map(FTL => (
            <Button key={FTL.FTLName}>
              {FTL.FTLName}
            </Button>
          ))}
        </UnorderedList>
      </Box>
    );
  }