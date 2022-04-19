import React from 'react';
import { Box, Heading, ListItem, UnorderedList, Button } from '@chakra-ui/react';
import FastTravelLocation from '../../classes/FastTravelLocation';
import getFastTravelAreas from '../world/FastTravelConstants';
import { useFastTravelLocation }  from '../world/WorldMap';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import usePlayersInTown from '../../hooks/usePlayersInTown';


/** 
 * 
 */

export default function FTLList(): JSX.Element {
    const FTLs = getFastTravelAreas();
    const { myPlayerID } = useCoveyAppState();
    const players = usePlayersInTown();
    const myPlayer = players.find(player => player.id === myPlayerID);

    const HandleButonCLick = (FTL: FastTravelLocation) => useFastTravelLocation(FTL, myPlayer!);
    
    
    return (
    <Box>
        <Heading as='h2' fontSize='l'>Fast Travel Locations:</Heading>
        <UnorderedList>
          {FTLs.map(FTL => (

            <Button key={FTL.FTLName} colorScheme='blue' onClick={() => HandleButonCLick(FTL)}>
              {FTL.FTLName}
            </Button>
          ))}
        </UnorderedList>
      </Box>
    );
  }