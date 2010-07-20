

(function($){

    $.fn.jsDoodle = function(options) {
    
        function posFromEvent(e,self) {
          return {x:(e.pageX-self.offsetLeft)*1.0/self.offsetWidth,
            y:(e.pageY-self.offsetTop)*1.0/self.offsetHeight
          };
        }
        
        SetLineWidth=function(width) {
          return {
            w:width,
            draw:function(ctx) { ctx.lineWidth=this.w; }
          }
        };
        SetLineCap=function(width) {
          return {
            w:width,
            draw:function(ctx) { ctx.lineCap=this.w; }
          }
        };
        
        SetStrokeStyle=function(pstyle) {
          return {
            style:pstyle,
            draw:function(ctx) { ctx.strokeStyle=this.style; }
          }
        }
        
        DrawTo=function(toPos){
          return {
            to:toPos,
            draw:function(ctx) {ctx.lineTo(this.to.x*ctx.canvas.width,this.to.y*ctx.canvas.height); }
          }
        };
        BeginPath=function() {
          return {
            draw:function(ctx) {ctx.beginPath(); }
          }
        };
        ClosePath=function(){
          return {
            draw:function(ctx) {ctx.closePath(); }
          }
        };
        MoveTo=function(toPos){
          return {
            to:toPos,
            draw:function(ctx) { 
            ctx.moveTo(this.to.x*ctx.canvas.width,this.to.y*ctx.canvas.height); }
          }
        };
        Stroke=function() {
          return {
            draw:function(ctx) {ctx.stroke(); }
          }
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
       var drawList = [];
       
       drawList.clone=function() { new Array(this); }

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

//         ctx.strokeStyle=options.lineColor;
//         ctx.lineCap=options.lineCap;
  //       ctx.lineWidth=options.lineWidth;
  
    append(new BeginPath());
    append(new MoveTo(oldpos));
    append(new DrawTo(pos));
    append(new Stroke());
    append(new ClosePath());
  /*
         ctx.beginPath();
         ctx.moveTo(oldpos.x,oldpos.y);
         ctx.lineTo(pos.x,pos.y);
         ctx.stroke();
         ctx.closePath();         
         */
       });
       
       function append(object) {
         drawList[drawList.length]=object;
         object.draw(ctx);
       }
       
       function init() {
         append(new SetLineWidth(options.lineWidth));
         append(new SetStrokeStyle(options.lineColor));
         append(new SetLineCap(options.lineCap));
         append(new BeginPath());
       }
       
       init();
       
       return {
       
         undo:function() {
           drawList.pop();
           this.redraw();
         },
       
         redraw:function() {
           this.clear();
           for(i=0;i<drawList.length;i++) {
             drawList[i].draw(ctx);
           }
         },
         
         setImage:function(x) {
           drawList=x;
         },
         
         getImage:function() {
           return drawList;
         },
         
         clear:function() {
           //alert("cler");
           ctx.fillStyle='#fff';
           ctx.lineWidth=0;
           ctx.clearRect(0,0,canvas.width,canvas.height);
         }
       }
    };
})(jQuery);

