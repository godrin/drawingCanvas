

(function($){

    $.fn.jsDoodle = function(options) {
        // Define default settings.
        var options = $.extend({
            lineWidth: 6,
        },options);
    
       $(this).mousedown(function(e){
         elem=this;
         var x=e.clientX;
         var y=e.clientY;
         elem.lastX=x;
         elem.lastY=y;
       });
       $(this).mouseup(function(e) {
         this.lastX=this.lastY=null;
       });
       $(this).mousemove(function(e) {
         if(!this.lastX)
           return;
         var lx=this.lastX;
         var ly=this.lastY;
         var x=e.clientX;
         var y=e.clientY;
         this.lastX=x;
         this.lastY=y;
         
         var canvas=$("canvas").get(0);
         if ($.browser.msie) // excanvas hack
           canvas = window.G_vmlCanvasManager.initElement(canvas);
          var ctx = canvas.getContext("2d");

ctx.lineWidth=6; //this.lineWidth;
ctx.beginPath();
ctx.moveTo(lx,ly); //this.start.x, this.start.y);
//            this.obj.ctx.quadraticCurveTo(((this.start.x + this.end.x) / 1.8),((this.start.y + this.end.y) / 2.4), this.end.x, this.end.y);
ctx.lineTo(x,y);
ctx.stroke();
ctx.closePath();         
//         alert(elem);
       });
    };
})(jQuery);

