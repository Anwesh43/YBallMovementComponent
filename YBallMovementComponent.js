const w = window.innerWidth, h = window.innerHeight
class YBallMovementComponent extends HTMLElement {
    constructor() {
        super()
        this.img = document.createElement('img')
        const shadow = this.attachShadow({mode:'open'})
        shadow.appendChild(this.img)
        this.animator = new Animator()
        this.yBallMovment = new YBallMovement()
    }

    render() {
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const context = canvas.getContext('2d')
        context.fillStyle = '#212121'
        context.fillRect(0, 0, w, h)
        this.img.src = canvas.toDataURL()
    }

    connectedCallback() {
        this.render()
        this.img.onmousedown = () => {
            this.yBallMovement.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.yBallMovement.update(() => {
                        this.animator.stop()
                    })
                })
            })
        }
    }
}

class State {
    constructor() {
        this.scales = [0,0,0]
        this.prevScale = 0
        this.dir = 0
        this.j = 0
    }
    update(stopcb) {
        this.scales[this.j] += 0.1 * this.dir
        if (Math.abs(this.scales[this.j] - this.prevScale) > 1) {
            this.scales[this.j] = this.prevScale + this.dir
            this.j += this.dir
            if (this.j == this.scales.length || this.j == -1) {
                this.j -= this.dir
                this.dir = 0
                this.prevScale = this.scales[this.j]
                stopcb()
            }
        }
    }
    startUpdating(startcb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            startcb()
        }
    }
}

class Animator {
    constructor() {
        this.animated = false
    }
    start(updatecb) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                updatecb()
            }, 50)
        }
    }
    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class YBallMovement {
    constructor() {
        this.state = new State()
    }
    draw(context) {
        const x = w/2, y = h/2, l = Math.min(w,h)/3, r = l/10, updatedL = l * (1 -this.state.scales[0])
        context.save()
        context.translate(w/2, h/2 + (h/2 + 2 * r) * this.state.scales[2])
        context.scale(1 + this.state.scales[1], 1 + this.state.scales[1])
        for(var i = 0; i < 3 - 2 * Math.floor(this.state.scales[0]); i++) {
            context.save()
            context.rotate(-Math.PI/6 + (2 * Math.PI/3) * i)
            context.beginPath()
            context.moveTo(0, 0)
            context.lineTo(updatedL, 0)
            context.stroke()
            context.save()
            context.translate(updatedL, 0)
            context.arc(0, 0, r, 0, 2 * Math.PI)
            context.fill()
            context.restore()
            context.restore()
        }
        context.restore()
    }
    update(stopcb) {
        this.state.update(stopcb)
    }
    startUpdating(startcb) {
        this.state.startUpdating(startcb)
    }
}

customElements.define('yball-movement', YBallMovementComponent)
