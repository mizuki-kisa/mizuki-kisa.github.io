var NumberAbsolutNode = {
  name: "Absolute number",
  category: "Number Utilities",
  initialize: function(){
    this._internal.number = 0;
    this.flagOutputDirty("result");
  },
  inputs: {
    number: {
      type: "number",
      displayName: "Number",
      set: function(value){
        if(value === undefined || value === null) value = 0;
        if(this._internal.number === value) return;
        this._internal.number = Math.abs(value);
        this.flagOutputDirty("result");
      }
    }
  },
  outputs: {
    result: {
      type: "number",
      displayName: "Result",
      getter: function(){
        return this._internal.number;
      }
    }
  },
  prototypeExtensions: {
  }
};

var NumberLimitNode = {
  name: "Limit number",
  category: "Number Utilities",
  initialize: function(){
    this._internal.number = 0;
    this._internal.low = 0;
    this._internal.high = 1;
    this._internal.result = 0;
  },
  inputs: {
    number: {
      type: "number",
      displayName: "Number",
      set: function(value){
        if(value === undefined || value === null) value = 0;
        if(this._internal.number === value) return;
        this._internal.number = value;
        this.schedule(this.checkLimits.bind(this));
      }
    },
    low: {
      type: "number",
      displayName: "Lower limit",
      group: "Limit",
      set: function(value){
        if(value === undefined || value === null) value = 0;
        if(this._internal.low === value) return;
        this._internal.low = value;
        this.schedule(this.checkLimits.bind(this));
      }
    },
    high: {
      type: "number",
      displayName: "Upper limit",
      group: "Limit",
      set: function(value){
        if(value === undefined || value === null) value = 0;
        if(this._internal.high === value) return;
        this._internal.high = value;
        this.schedule(this.checkLimits.bind(this));
      }
    }
  },
  outputs: {
    result: {
      type: "number",
      displayName: "Result",
      getter: function(){
        return this._internal.result;
      }
    }
  },
  prototypeExtensions: {
    schedule: function(callback) {
      if(!this._internal.hasScheduled) {
        this._internal.hasScheduled = true;
        this.scheduleAfterInputsHaveUpdated(function() {
          callback();
          this._internal.hasScheduled = false;
        });
      }
    },
    checkLimits: function(){
      this._internal.result = this._internal.number;
      if(this._internal.number > this._internal.high) this._internal.result = this._internal.high;
      if(this._internal.number < this._internal.low) this._internal.result = this._internal.low;
      this.flagOutputDirty("result");
    }
  }
};


var NumberRandomNode = {
  name: "Random number",
  category: "Number Utilities",
  initialize: function(){
    this._internal.low = 0;
    this._internal.high = 100;
    this._internal.random = 0;
    this.scheduleAfterInputsHaveUpdated(function() {
      this.generateRandom();
    }); 
  },
  inputs: {
    generate: {
      type: "signal",
      displayName: "Generate",
      group: "Random",
      valueChangedToTrue: function(){
        this.scheduleAfterInputsHaveUpdated(function() {
          this.generateRandom();
        }); 
      }
    },
    low: {
      type: "number",
      displayName: "Lower limit",
      group: "Range",
      default: 0,
      set: function(value){
        if(value === undefined || value === null) value = 0;
        this._internal.low = value;
      }
    },
    high: {
      type: "number",
      displayName: "Upper limit",
      group: "Range",
      default: 100,
      set: function(value){
        if(value === undefined || value === null) value = 100;
        this._internal.high = value;
      }
    }
  },
  outputs: {
    random: {
      type: "number",
      displayName: "Random number",
      group: "Result",
      getter: function(){
        return this._internal.random;
      }
    }
  },
  prototypeExtensions: {
    generateRandom: function(){
      this._internal.random = getRandomIntInclusive(this._internal.low,this._internal.high);
      this.flagOutputDirty("random");
    }
  }
};

var NumberRoundNode = {
  name: "Round number",
  category: "Number Utilities",
  initialize: function(){
    this._internal.inputNumber;
    this._internal.decimals = 0;
    this._internal.result = 0;
    
  },
  inputs: {
    inputNumber: {
      type: "number",
      displayName: "Number",
      group: "Round",
      set: function(value){
        if(value === undefined || value === null || this._internal.inputNumber === value) return;
        this._internal.inputNumber = value;
        this.schedule(this.roundNumber.bind(this));
      }
    },
    decimals: {
      type: "number",
      displayName: "Decimals",
      group: "Round",
      default: 0,
      set: function(value){
        if(value === undefined || value === null || this._internal.decimals === value) return;
        if(value < 0) value = 0;
        if(value > 10) value = 10;
        value = Math.round(value);
        this._internal.decimals = value;
        this.schedule(this.roundNumber.bind(this));
      }
    }
  },
  outputs: {
    result: {
      type: "number",
      displayName: "Result",
      group: "Round",
      getter: function(){
        return this._internal.result;
      }
    }
  },
  prototypeExtensions: {
    schedule: function(callback) {
      if(!this._internal.hasScheduled) {
        this._internal.hasScheduled = true;
        this.scheduleAfterInputsHaveUpdated(function() {
          callback();
          this._internal.hasScheduled = false;
        });
      }
    },
    roundNumber: function(){
      this._internal.result = getRoundedNumber(this._internal.inputNumber,this._internal.decimals);
      this.flagOutputDirty("result");
    }
  }
};

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRoundedNumber(num,places) {
  if(places == 0) return Math.round(num);
  return +(Math.round(num + "e+" + places)  + "e-" + places);
}

Noodl.defineModule({
  nodes:[
    NumberAbsolutNode,
    NumberLimitNode,
    NumberRandomNode,
    NumberRoundNode
  ],
  setup:function() {
    console.log('Number Utils module loaded');
  }
});