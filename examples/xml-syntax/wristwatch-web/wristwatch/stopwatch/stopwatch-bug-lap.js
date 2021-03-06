"use hopscript"

var TD = require ("../data/time-data.js");
var BD = require ("../data/beep-data.js");
var SD = require ("./stopwatch-data.js");

var foo=SD.IncrementStopwatchTime;
var rjs = require("hiphop");
exports.rjs = rjs;

// The BASIC_STOPWATCH hiphop code
//================================

var BASIC_STOPWATCH =
    <rjs.reactivemachine debug name="BASIC_STOPWATCH">

      // Basic stopwatch I/Os
      //---------------------
      
      <rjs.inputsignal name="HS"/>
      <rjs.inputsignal name="START_STOP_COMMAND"/>
      
      <rjs.outputsignal name="STOPWATCH_TIME"
			init_value=${SD.InitialStopwatchTime}/>
      <rjs.outputsignal name="STOPWATCH_RUN_STATUS" init_value=${false}/>
      <rjs.outputsignal name="BEEP" init_value=${BD.NoBeep}/>
      
      // Basic stopwatch reactive code
      //------------------------------

      // initialization, emit initial zero time
	
      <rjs.emit signal_name="STOPWATCH_TIME" exprs=${SD.InitialStopwatchTime}/>
	
      // loop between off and on
      
      <rjs.loop>

	// idle mode

	<rjs.emit signal_name="STOPWATCH_RUN_STATUS" exprs=${false}/>
	<rjs.await signal_name="START_STOP_COMMAND"/>
	
        // start the stopwatch

        <rjs.emit signal_name="STOPWATCH_RUN_STATUS" exprs=${true}/>
	<rjs.emit signal_name="BEEP" exprs=${BD.Stopwatch_NumberOfBeepsPerSecond}/>

	// time counting mode
	
	<rjs.abort signal_name="START_STOP_COMMAND">
	  <rjs.every signal_name="HS">
	    <rjs.emit signal_name="STOPWATCH_TIME"
		      func=${SD.IncrementStopwatchTime}
		      exprs=${rjs.preValue("STOPWATCH_TIME")}/>
	    <rjs.emit signal_name="BEEP"
		      func=${SD.StopwatchBeep}
		      exprs=${rjs.value("STOPWATCH_TIME")}/>
	  </rjs.every>
	</rjs.abort>

	// beeping when the stopwatch stops, and back to idle mode
		
        <rjs.emit signal_name="BEEP"
		  exprs=${BD.Stopwatch_NumberOfBeepsPerSecond}/>
      </rjs.loop>
    </rjs.reactivemachine>;

exports.BASIC_STOPWATCH = BASIC_STOPWATCH;

// The LAP_FILTER hiphop code
//===========================

var LAP_FILTER =
    <rjs.reactivemachine debug name="LAP_FILTER">

      // Lap filter I/Os
      //----------------
      <rjs.inputsignal name="BASIC_STOPWATCH_TIME"
		       init_value=${SD.InitialStopwatchTime}/>
      <rjs.inputsignal name="LAP_COMMAND"/>
      
      <rjs.outputsignal name="STOPWATCH_TIME"
			init_value=${SD.InitialStopwatchTime}/>
      <rjs.outputsignal name="STOPWATCH_LAP_STATUS" init_value=${false}/>

      // Lap filter reactive code
      //=========================

      // loop between passing and non-passing mode

      <rjs.loop>
	<rjs.emit signal_name="STOPWATCH_LAP_STATUS" exprs=${false}/>
	
         // passing mode, until next LAP_COMMAND

	<rjs.abort signal_name="LAP_COMMAND">
	  <rjs.loopeach signal_name="BASIC_STOPWATCH_TIME">
	    <rjs.emit signal_name="STOPWATCH_TIME"
		      exprs=${rjs.value("BASIC_STOPWATCH_TIME")}/>
	  </rjs.loopeach>
	</rjs.abort>
	  
        // LAP_COMMAND received, enter non-passing mode

	<rjs.emit signal_name="STOPWATCH_LAP_STATUS" exprs=${true}/>	
	<rjs.await signal_name="LAP_COMMAND"/>

      </rjs.loop>
    </rjs.reactivemachine>;

// The main STOPWATCH hiphop code, obtained by combining BASIC_STOPWATCH, LAP_FILTER,
// and a reset detector

var STOPWATCH =
   <rjs.reactivemachine debug name="STOPWATCH">

     // STOPWATCH I/Os
     //---------------
     <rjs.inputsignal name="HS"/>
     <rjs.inputsignal name="START_STOP_COMMAND"/>
     <rjs.inputsignal name="LAP_COMMAND"/>
     
     <rjs.outputsignal name="STOPWATCH_TIME" init_value=${SD.InitialStopwatchTime}/>
     <rjs.outputsignal name="STOPWATCH_RUN_STATUS" init_value=${false}/>
     <rjs.outputsignal name="STOPWATCH_LAP_STATUS" init_value=${false}/>
     <rjs.outputsignal name="BEEP" init_value=${BD.NoBeep}/>
     <rjs.outputsignal name="BASIC_STOPWATCH_TIME"
		       init_value=${SD.InitialStopwatchTime}/> // to be put back as locals
     <rjs.outputsignal name="RESET"/>

     
     // STOPWATCH reactive code
     //------------------------
     
	 // run BASIC_STOPWATCH and LAP_FILTER in parallel
	 //-----------------------------------------------
	 <rjs.parallel>
	   <rjs.loopeach signal_name="RESET"/>
	     <rjs.parallel>
	       <rjs.run machine=${BASIC_STOPWATCH}
			sigs_assoc=${{"HS" : "HS",
				      "STOPWATCH_TIME" : "BASIC_STOPWATCH_TIME",
				      "START_STOP_COMMAND" : "START_STOP_COMMAND",
				      "STOPWATCH_RUN_STATUS" : "STOPWATCH_RUN_STATUS", 
				      "BEEP" : "BEEP"}}/>
	       <rjs.run machine=${LAP_FILTER}
			sigs_assoc=${{"BASIC_STOPWATCH_TIME" : "BASIC_STOPWATCH_TIME",
				      "LAP_COMMAND" : "LAP_COMMAND",
				      "STOPWATCH_TIME" : "STOPWATCH_TIME",
				      "STOPWATCH_LAP_STATUS" : "STOPWATCH_LAP_STATUS"}}/>
	     </rjs.parallel>
	   </rjs.loopeach>
	   // Reset handling code
	   //--------------------
	   
	   <rjs.loop>
	     <rjs.trap trap_name="Reset">
	       <rjs.localsignal name="STOPWATCH_STOPPED">
		 <rjs.parallel>

		   // compute STOPWATCH_STOPPED
		   
		   <rjs.loop>
		     <rjs.abort signal_name="START_STOP_COMMAND">
		       <rjs.sustain signal_name="STOPWATCH_STOPPED"/> </rjs.parallel>
		     </rjs.abort>
		     <rjs.await signal_name="START_STOP_COMMAND"/>
		   </rjs.loop>
		   
		   // compute RESET
		   <rjs.loop>
		     <rjs.await signal_name="LAP_COMMAND"/>
		     // LAP_COMMAND received when not in LAP mode
		     <rjs.present signal_name="STOPWATCH_STOPPED">
		       <rjs.emit signal_name="RESET"/>
		       <rjs.exit trap_name="Reset"/>
		     </rjs.present>
		     <rjs.await signal_name="LAP_COMMAND"/>
		   </rjs.loop>
		   
		 </rjs.parallel>
	       </rjs.localsignal>
	     </rjs.trap>
	   </rjs.loop>
	 </rjs.parallel>
   </rjs.reactivemachine>;

exports.STOPWATCH = STOPWATCH;
