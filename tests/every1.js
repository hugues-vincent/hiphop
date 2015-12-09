"use hopscript"

var hh = require("hiphop");

var prg =
    <hh.reactivemachine debug name="every1">
      <hh.inputsignal name="I"/>
      <hh.outputsignal name="O"/>
      <hh.every signal_name="I">
	<hh.emit signal_name="O"/>
      </hh.every>
    </hh.reactivemachine>;

exports.prg = prg;
