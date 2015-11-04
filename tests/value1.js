"use hopscript"

var rjs = require("../xml-compiler.js");
var rk = require("../reactive-kernel.js");

var sigO = new rk.ValuedSignal("O", "number", "+", false, 5);

var prg = <rjs.ReactiveMachine name="value1">
    <rjs.outputsignal ref=${sigO}/>
    <rjs.loop>
    <rjs.sequence>
    <rjs.emit signal_name="O" value_expr="5"/>
    <rjs.emit signal_name="O" value_expr="10"/>
    <rjs.pause/>
    </rjs.sequence>
   </rjs.loop>
   </rjs.ReactiveMachine>;

exports.prg = prg;