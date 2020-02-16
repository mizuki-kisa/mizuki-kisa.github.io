var ColorHexToRgb = {
	name: "HEX to RGB",
	category: "Utilities (Color)",
	initialize: function () {
		this._internal.inputHex = "#000000";
		this._internal.outputRGB = [0,0,0];
		this._internal.hasScheduledConversion = false;
	},
	inputs: {
		inputHex: {
			type: 'color',
			displayName: 'HEX color',
			group: 'HEX',
			set: function(value){
				if(this._internal.inputHex === value) return;
				this._internal.inputHex = value;
				this.scheduleConvertion();
			}
		}
	},
	outputs: {
		red: {
			type: 'number', // string, boolean, number, signal
			displayName: 'Red',
			group: 'RGB',
			getter:function(){
				return this._internal.outputRGB[0];
			}
		},
		green: {
			type: 'number', // string, boolean, number, signal
			displayName: 'Green',
			group: 'RGB',
			getter:function(){
				return this._internal.outputRGB[1];
			}
		},
		blue: {
			type: 'number', // string, boolean, number, signal
			displayName: 'Blue',
			group: 'RGB',
			getter:function(){
				return this._internal.outputRGB[2];
			}
		}
	},
	prototypeExtensions: {
		scheduleConvertion: function(){
			if(!this._internal.hasScheduledConversion) {
				this._internal.hasScheduledConversion = true;
				this.scheduleAfterInputsHaveUpdated(function() {
					this.convertColor();
					this._internal.hasScheduledConversion = false;
				});
			}
		},
		convertColor: function(){
			this._internal.outputRGB = hexToRGB(this._internal.inputHex);
			this.flagOutputDirty("red");
			this.flagOutputDirty("green");
			this.flagOutputDirty("blue");
		}
	}
};

var ColorRgbToHex = {
	name: "RGB to HEX",
	category: "Utilities (Color)",
	initialize: function () {
		this._internal.inputRGB = [0,0,0];
		this._internal.outputHex = "#000000";
		this._internal.hasScheduledConversion = false;
	},
	inputs: {
		red: {
			type: 'number', // string, boolean, number, signal
			displayName: 'Red',
			group: 'RGB',
			set: function(value){
				value = this.limit(value);
				if(this._internal.inputRGB[0] === value) return;
				this._internal.inputRGB[0] = value;
				this.scheduleConvertion();
			}
		},
		green: {
			type: 'number', // string, boolean, number, signal
			displayName: 'Green',
			group: 'RGB',
			set: function(value){
				value = this.limit(value);
				if(this._internal.inputRGB[1] === value) return;
				this._internal.inputRGB[1] = value;
				this.scheduleConvertion();
			}
		},
		blue: {
			type: 'number', // string, boolean, number, signal
			displayName: 'Blue',
			group: 'RGB',
			set: function(value){
				value = this.limit(value);
				if(this._internal.inputRGB[2] === value) return;
				this._internal.inputRGB[2] = value;
				this.scheduleConvertion();
			}
		}
	},
	outputs: {
		outputHex: {
			type: 'color',
			displayName: 'Color',
			group: 'HEX',
			getter:function(){
				return this._internal.outputHex;
			}
		}
	},
	prototypeExtensions: {
		scheduleConvertion: function(){
			if(!this._internal.hasScheduledConversion) {
				this._internal.hasScheduledConversion = true;
				this.scheduleAfterInputsHaveUpdated(function() {
					this.convertColor();
					this._internal.hasScheduledConversion = false;
				});
			}
		},
		convertColor: function(){
        	this._internal.outputHex = rgbToHEX(this._internal.inputRGB[0],this._internal.inputRGB[1],this._internal.inputRGB[2])
			this.flagOutputDirty("outputHex");
		},
		limit: function(value){
			if(value > 255) return 255;
			if(value < 0) return 0;
			return value;
		}
	}
};

var ColorHueRotation = {
	name: "Hue Rotation",
	category: "Utilities (Color)",
	initialize: function () {
		this._internal.inputHex = "#000000";
		this._internal.outputHex = "#000000";
		this._internal.rotationValue = 0;
		this._internal.hasScheduledRotation = false;
	},
	inputs: {
		inputHex: {
			type: 'color',
			displayName: 'Color',
			group: 'Rotate',
			set: function(value){
				if(this._internal.inputHex === value) return;
				this._internal.inputHex = value;
				this.scheduleRotation();
			}
		},
		rotationValue: {
			type: 'number',
			displayName: 'Rotation',
			group: 'Rotate',
			set: function(value){
				if(this._internal.rotationValue === value) return;
				this._internal.rotationValue = value;
				this.scheduleRotation();
			}
		}
	},
	outputs: {
		outputHex: {
			type: 'color',
			displayName: 'Color',
			group: 'Result',
			getter:function(){
				return this._internal.outputHex;
			}
		}
	},
	prototypeExtensions: {
		scheduleRotation: function(){
			if(!this._internal.hasScheduledRotation) {
				this._internal.hasScheduledRotation = true;
				this.scheduleAfterInputsHaveUpdated(function() {
					this.rotateColor();
					this._internal.hasScheduledRotation = false;
				});
			}
		},
		rotateColor: function(){
			var rgb = hexToRGB(this._internal.inputHex)
			var hsl = rgbToHSL(rgb[0],rgb[1],rgb[2]);

			var offset = this._internal.rotationValue || 0;
			var hue = hsl[0]*360;
			var v = hue + offset;
			v /= 360;
			v = v - Math.floor(v);
			
			rgb = hslToRGB(v,hsl[1],hsl[2]);
        	this._internal.outputHex = rgbToHEX(rgb[0],rgb[1],rgb[2]);
			this.flagOutputDirty("outputHex");
		}
	}
};

// Color conversion methods are credited to: https://gist.github.com/mjackson
// and can be found here: https://gist.github.com/mjackson/5311256

function hexToRGB(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	var r = parseInt(result[1], 16);
	var g = parseInt(result[2], 16);
	var b = parseInt(result[3], 16);
	return [r,g,b];
}

function rgbToHEX(red,green,blue){
	var rgb = blue | (green << 8) | (red << 16);
	var hex = '#' + (0x1000000 + rgb).toString(16).slice(1);
	return hex;
}

function rgbToHSL(red,green,blue) {

	var r = red/255;
	var g = green/255;
	var b = blue/255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if(max == min){
      h = s = 0; // achromatic
    }else{
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
	return [h,s,l];
}

function hslToRGB(h, s, l) {
	var r, g, b;
	if (s == 0) {
		r = g = b = l; // achromatic
	} else {
		function hue2rgb(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1/6) return p + (q - p) * 6 * t;
			if (t < 1/2) return q;
			if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		}

		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;

		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1/3);
	}

	r *= 255;
	g *= 255;
	b *= 255;
	return [r,g,b];
}


Noodl.defineModule({
	nodes:[
		ColorHexToRgb,
		ColorRgbToHex,
		ColorHueRotation
	],
	setup:function() {
		console.log('Color Utils module loaded');
	}
});