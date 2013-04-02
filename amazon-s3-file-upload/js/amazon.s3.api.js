var AmazonS3Api = Backbone.Model.extend({
	components: {
		form: null,
		requestURL: ""
	},

	initialize: function(){
	    this.updatePolicy();
		this.createFormdata();
	},

	createFormdata: function() {
		var formdata = new FormData();

        formdata.append("key", this.get('key'));
        formdata.append("acl", this.get('acl'));
        formdata.append("Content-Type", this.get('contentType'));
        formdata.append("AWSAccessKeyId", this.get('AWSAccessKeyId'));
        formdata.append("x-amz-meta-filename", this.get('filename'));
        formdata.append("Policy", this.get('policy'));
        formdata.append("Signature", this.get('signature'));
		
		var blob = this.dataURItoBlob(this.get('data'), this.get('contentType'));
		formdata.append("file", blob, this.get('filename'));

		this.components.form = formdata;
	},

	updatePolicy: function(){
	    var key = this.get('folder') + this.get('filename');
	    this.set({ key: key });

	    var POLICY_JSON = {
	    	"expiration": "2013-12-12T12:00:00.000Z", // TODO: Adapt to your needs
			"conditions": [
				["eq", "$bucket", this.get('bucket')],
				["starts-with", "$key", this.get('key')],
				{"acl": this.get('acl')},
				{"x-amz-meta-filename": this.get('filename')},
				["starts-with", "$Content-Type", this.get('contentType')]
			]
		};

	    var secret = this.get('AWSSecretKeyId');
	    var policyBase64 = Base64.encode(JSON.stringify(POLICY_JSON));
	    var signature = b64_hmac_sha1(secret, policyBase64);
	    
	    this.set({ policy: policyBase64 });
	    this.set({ signature: signature });
		
		this.components.requestURL = "http://"+ this.get('bucket') +".s3.amazonaws.com";
	},
	
	upload: function() {
		var self = this,
			xhr = new XMLHttpRequest();
		
        xhr.onreadystatechange = function() {
            if(this.readyState == this.DONE) {
				var location = self.components.requestURL + "/" + self.get("key");
                self.trigger("fileUploaded", location);
				console.log("File uploaded!");
            }
        }

        xhr.open("POST", this.components.requestURL, true);
        xhr.send(this.components.form);
	},
	
	dataURItoBlob: function(dataURI, ImgType) {
		var binary = atob(dataURI.split(',')[1]);
		var array = [];
		for (var i = 0; i < binary.length; i++) {
			array.push(binary.charCodeAt(i));
		}
		return new Blob([new Uint8Array(array)], {type: ImgType});
	}
});