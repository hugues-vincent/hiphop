"use hopscript"

var hh = require("hiphop");

function foo(evt) {
   console.log("hi from foo signal", evt.signalName, "is set!")
}

function bar(evt) {
   console.log("hi from bar signal", evt.signalName, "is set with value",
	       evt.signalValue, "!")
}

var inSig={accessibility:hh.IN};

var prg = <hh.module I1=${inSig} I2=${inSig} I3=${inSig} I4=${inSig} O1 O2 O3 O4>
  <hh.loop>
    <hh.sequence>
      <hh.if I1>
	<hh.emit O1/>
      </hh.if>
      <hh.if I2>
	<hh.emit O2 apply=${function() {return this.value.I2}}/>
      </hh.if>
      <hh.if I3>
	<hh.emit O3 apply=${function() {return this.value.I3}}/>
      </hh.if>
      <hh.if I4>
	<hh.emit O4 apply=${function() {return this.value.I4}}/>
      </hh.if>
      <hh.pause/>
    </hh.sequence>
  </hh.loop>
</hh.module>

var m = new hh.ReactiveMachine(prg, "mirror");
m.addEventListener("O1", foo);
m.addEventListener("O2", bar);
m.addEventListener("O3", bar);
m.addEventListener("O4", bar);

exports.prg = m
