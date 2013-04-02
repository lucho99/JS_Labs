var turing_machine = {
	alphabet: '',

	constants: {
		animationTime: 300,
		cursorSize: 21
	},

	regions: {
		alphabet: '#alphabet',
		input: '#input-text',
		output: '#output-text',
		buttons: {
			encode: '#encode_btn',
			decode: '#decode_btn',
			swipe: '#swipe_btn'
		},
		form: {
			input: '#i_str',
			output: '#o_str'
		},
		wrappers: {
			alphabet: '#wrap-alphabet',
			input: '#wrap-input-text',
			output: '#wrap-output-text'
		},
		cursors: {
			alphabet: '#alphabet-cursor',
			input: '#input-text-cursor',
			output: '#output-text-cursor'
		}
	},

	_init: function() {
		var 
			self = this,
			alphabetEl = $(this.regions.alphabet)
		;

		this.alphabet = this.Utf8.decode(' abcdefghijklmnñopqrstuvwxyz');

		alphabetEl.append('<td><div>...</div></td>');
		for(var i = 0; i < this.alphabet.length; i++) {
			alphabetEl.append('<td><div>' + this.alphabet[i] + '</div></td>');
		}
		alphabetEl.append('<td><div>...</div></td>');

		$(this.regions.buttons.encode).bind("click", function() {
			self.encode();
		});
		$(this.regions.buttons.decode).bind("click", function() {
			self.decode();
		});
		$(this.regions.buttons.swipe).bind("click", function() {
			self.swap();
		});
	},

	Utf8: {
		decode : function(utftext) {
			var 
				string = "",
				i = 0,
				c = c1 = c2 = 0
			;

			while(i < utftext.length) {
				c = utftext.charCodeAt(i);
				if(c < 128) {
					string += String.fromCharCode(c);
					i++;
				} else if((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i + 1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				} else {
					c2 = utftext.charCodeAt(i + 1);
					c3 = utftext.charCodeAt(i + 2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
			}
			return string;
		}
	},
	encode: function() {
		var 
			i_str = ($(this.regions.form.input).val()).toLowerCase(),
			o_str = ''
		;

		if (i_str.length > 0) {
			this.init_tapes(i_str);
			this.animate_tapes(i_str, 0, 0, 'encode');
		} 
		else {
			alert("You must specify a text to encode");
		}
	},
	decode: function() {
		var 
			i_str = ($(this.regions.form.input).val()).toLowerCase(),
			o_str = ''
		;

		if (i_str.length > 0) {
			this.init_tapes(i_str);
			this.animate_tapes(i_str, 0, 0, 'decode');
		} 
		else {
			alert("You must specify a text to decode");
		}
	},
	init_tapes: function(i_str) {
		var 
			inputEl = $(this.regions.input),
			outputEl = $(this.regions.output)
		;

		$(this.regions.form.output).val('');

		inputEl.empty().append('<td><div>...</div></td>').show();
		outputEl.empty().append('<td><div>...</div></td>').show();

		for(var i = 0; i < i_str.length; i++) {
			inputEl.append('<td><div>' + i_str[i] + '</div></td>');
			outputEl.append('<td visited="f"><div></div></td>');
		}

		inputEl.append('<td><div>...</div></td>');
		outputEl.append('<td><div>...</div></td>');

		$(this.regions.wrappers.alphabet).show();
		$(this.regions.wrappers.input).show();
		$(this.regions.wrappers.output).show();
		$(this.regions.cursors.alphabet).show();
		$(this.regions.cursors.input).show();
		$(this.regions.cursors.output).show();
	},
	animate_tapes: function(i_str, i, pos, type) {
		var 
			self = this,
			wrapAlphabetEl = $(this.regions.wrappers.alphabet),
			wrapInputText = $(this.regions.wrappers.input),
			time = this.constants.animationTime,
			cursorSize = this.constants.cursorSize
		;

		wrapAlphabetEl.animate({
			'margin-left' : 0
		}, time, function() {
			wrapInputText.animate({
				'margin-left' : pos -= cursorSize
			}, time, function() {
				var ml_alphabet = 0;
				$.each(self.alphabet, function(kj, vj) {
					wrapAlphabetEl.animate({
						'margin-left' : ml_alphabet -= cursorSize
					}, time, function() {
						if (i_str[i] == ' ') {
							wrapAlphabetEl.clearQueue().stop();
							return set_char(0, i_str, i += 1, pos, type);
						} 
						else if(i_str[i] == vj) {
							var n_pos = 0;
							if (type == 'encode') {
								if (kj + 3 < self.alphabet.length) {
									n_pos += kj + 4;
								}
								else {
									n_pos -= (self.alphabet.length - kj) - 5;
								}
							} 
							else if (type == 'decode') {
								if (kj - 3 > 0) {
									n_pos += kj - 2;
								}
								else {
									n_pos += (self.alphabet.length + kj) - 3;
								}
							}
							wrapAlphabetEl.clearQueue().stop();
							return self.set_char(n_pos, i_str, i += 1, pos, type);
						}
					});
				});
			});
		});
	},
	set_char: function(n_pos, i_str, i, pos, type) {
		var 
			self = this,
			wrapAlphabetEl = $(this.regions.wrappers.alphabet),
			wrapInputText = $(this.regions.wrappers.input),
			wrapOutputText = $(this.regions.wrappers.output),
			outputEl = $(this.regions.output),
			cursorSize = this.constants.cursorSize
		;

		wrapAlphabetEl.animate({
			'margin-left' : n_pos * -cursorSize
		}, 300, function() {
			wrapOutputText.animate({
				'margin-left' : pos
			}, 300, function() {
				var c = true;
				outputEl.find('td').each(function() {
					if (c) {
						if ($(this).attr('visited') == 'f') {
							o_str = (n_pos == 0) ? self.alphabet[n_pos] : self.alphabet[n_pos - 1];
							$(this).html('<div>' + o_str + '</div>');
							$(this).attr('visited', 't');
							$(self.regions.form.output).val($(self.regions.form.output).val() + o_str);
							c = false;
						}
					}
				});
				if (i < i_str.length) {
					return self.animate_tapes(i_str, i, pos, type);
				}

				wrapAlphabetEl.animate({
					'margin-left' : 0
				}, 300, function() {
					wrapInputText.animate({
						'margin-left' : 0
					}, 300, function() {
						wrapOutputText.animate({
							'margin-left' : 0
						}, 300, function() {
							wrapAlphabetEl.clearQueue().stop();
							wrapInputText.clearQueue().stop();
							wrapOutputText.clearQueue().stop();
							return alert('Done!');
						});
					});
				});
				return false;
			});
		});
	},
	swap: function() {
		var inputEl = $(this.regions.form.input),
			outputEl = $(this.regions.form.output);
		inputEl.val(outputEl.val());
		outputEl.val('');
	}
};