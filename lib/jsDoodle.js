

(function($){

    $.fn.jsDoodle = function(options) {
    
        function posFromEvent(e,self) {
          return {x:e.clientX-self.offsetLeft,
            y:e.clientY-self.offsetTop
          };
        }

        // Define default settings.
        var options = $.extend({
            lineWidth: 6,
            lineColor:'#FFFF00',
            lineCap:"round",
        },options);
        
       var canvas=(this.get(0));
       if ($.browser.msie) // excanvas hack
         canvas = window.G_vmlCanvasManager.initElement(canvas);
       var ctx = canvas.getContext("2d");

       $(this).mousedown(function(e){
         this.linePos=posFromEvent(e,this);
       });
       $(this).mouseup(function(e) {
         this.linePos=null;
       });
       $(this).mousemove(function(e) {
         if(!this.linePos)
           return;
         var pos=posFromEvent(e,this);
         var oldpos=this.linePos;
         this.linePos=pos;

         ctx.strokeStyle=options.lineColor;
         ctx.lineCap=options.lineCap;
         ctx.lineWidth=options.lineWidth;
         ctx.beginPath();
         ctx.moveTo(oldpos.x,oldpos.y);
         ctx.lineTo(pos.x,pos.y);
         ctx.stroke();
         ctx.closePath();         
       });
       
       return {
         
         clear:function() {
           //alert("cler");
           ctx.fillStyle='#fff';
           ctx.lineWidth=0;
           ctx.clearRect(0,0,canvas.width,canvas.height);
         }
       }
    };
})(jQuery);

