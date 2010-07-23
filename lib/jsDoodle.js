

(function($){

    $.fn.jsDoodle = function(options) {
    
        function posFromEvent(e,self) {
          return {x:(e.pageX-self.offsetLeft)*1.0/self.offsetWidth,
            y:(e.pageY-self.offsetTop)*1.0/self.offsetHeight
          };
        }
        
        function createCanvas(parent) {
          var w=parent.clientWidth;
          var h=parent.clientHeight;
          var cv=$('<canvas width="'+w+'" height="'+h+'"></canvas>');
          cv.appendTo(parent);
          return cv.get(0);
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
            readonly:false,
        },options);
        
        var self=this.get(0);
        var canvas;
        if(self.nodeName=="CANVAS")
          canvas=self;
        else
          canvas=createCanvas(self);
        
       if ($.browser.msie) // excanvas hack
         canvas = window.G_vmlCanvasManager.initElement(canvas);
       var ctx = canvas.getContext("2d");
       
       Array.prototype.clone=function() {
         a=[];
         for(i=0;i<this.length;i++)
           a[a.length]=this[i];
         return a;
       }

       var drawList=[];

       $(this).mousedown(function(e){
         if(!options.readonly)
           this.linePos=posFromEvent(e,this);
       });
       $(this).mouseup(function(e) {
         if(!options.readonly)
           this.linePos=null;
       });
       $(this).mousemove(function(e) {
        if(options.readonly)
          return;
        if(!this.linePos)
            return;
          var pos=posFromEvent(e,this);
          var oldpos=this.linePos;
          this.linePos=pos;

          append(new BeginPath());
          append(new MoveTo(oldpos));
          append(new DrawTo(pos));
          append(new Stroke());
          append(new ClosePath());
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
           this.redraw();
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

