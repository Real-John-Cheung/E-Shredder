class Button {
    constructor(x,y,w,h,txt,textSz){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.txt = txt;
        this.textSz = textSz;
    }

    cursorisIn(){
        return (mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h)
    }

    display(){
        push();
        textFont(bloxFont);
        if (this.cursorisIn()) {
            fill(255);
            noStroke();
            if (this.textSz) textSize(this.textSz);
            rect(this.x,this.y,this.w,this.h);
           // textAlign(CENTER,CENTER);
            fill(0);
            noStroke();
            text(this.txt, this.x + 10, this.y + 10, this.w - 20, this.h - 20);
        } else {
            noFill();
            stroke(255);
            strokeWeight(5);
            if (this.textSz) textSize(this.textSz);
            rect(this.x,this.y,this.w,this.h);
            //textAlign(CENTER,CENTER);
            fill(255);
            noStroke();
            rect(this.x + 5, this.y + this.h, this.w - 10, 5);
            rect(this.x - 5, this.y + 5, 5, this.h - 10);
            text(this.txt, this.x + 10, this.y + 10, this.w - 20, this.h - 20);
        }
        pop();
    }
}