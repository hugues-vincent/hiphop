"use hopscript"

var hh = require("hiphop");

var prg =
    <hh.module>
      <hh.outputsignal name="O"/>
      <hh.outputsignal name="S"/>
      <hh.loop>
	<hh.abort test_pre signal_name="S">
	  <hh.emit signal_name="S"/>
	  <hh.pause/>
	  <hh.emit signal_name="O"/>
	</hh.abort>
	<hh.pause/>
      </hh.loop>
    </hh.module>;

exports.prg = new hh.ReactiveMachine(prg, "abortpre");
