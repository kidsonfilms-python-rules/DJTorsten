#ifndef __THE_PLAN__
#define __THE__PLAN__

// This class contains the "plan" - which is the list of tracks 
//  to be played (per chunk), audio control (base, volume, treble)

// DJF FILE STRUCTURE
// BYTES 0-69 -- HEADER
// BYTES 70-END -- BODY
//
// HEADER STRUCTURE
// ------------------
// byte  |  data name
// ------------------
// 0 - Mutable? 1 when yes (DJF cache) and when 0 no (exported DJF file to play in the future) 
// 1-4 - DJFlame Plan Intrepter version, used to insure compatibility
// 5 - 

class ThePlan {




}
