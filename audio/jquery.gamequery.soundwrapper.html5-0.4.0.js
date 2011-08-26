/*
 * gameQuery rev. $Revision$
 *
 * Copyright (c) 2008 Selim Arsever (gamequery.onaluf.org)
 * licensed under the MIT (MIT-LICENSE.txt)
 */
// this allow to used the convenient $ notation in  a plugins 
(function($) {
    // Here is a bogus soundWrapper written as an example
    $.gameQuery = $.extend($.gameQuery, {
        SoundWrapper: function(url, loop) {
            this.audio = new Audio();
            
            console.log("html5_audio_wrapper");
            
            // start loading the sound. Should turn this.ready to true once done.
            this.load  = function(){
            	
            	console.log("html5_audio_wrapper.load.url");
            	console.log(url);
            	            	
                this.audio.src = url;
                this.audio.loop = loop;
                this.audio.load();
            };
            
            // plays the sound if this.ready == true
            this.play  = function(){
            	console.log("html5_audio_wrapper.PLAY");
                this.audio.play();
            };
            
            // pauses the sound if it is playing
            this.pause = function(){
                this.audio.pause();
            };
            
            // stops the sound if it is playing, rewind (even if paused)
            this.stop  = function(){
                this.audio.pause();
                this.audio.currentTime = this.audio.startTime;
            };
            
            // mutes the sound without stoping it
            this.muted = function(mute){
                this.audio.muted = true;
            }
            
            // returns true if the sound is ready to be played
            this.ready = function(){
                return this.audio.readyState == this.audio.HAVE_ENOUGH_DATA;
            };
            
            // add the sound to the manager
            console.log("html5_audio_wrapper.resourceManager");
            $.gameQuery.resourceManager.addSound(this);
            return true;
        }});
})(jQuery);