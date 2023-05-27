import {
    type Body, Circle, Vec2
} from "planck";
import { type CollisionFilter, type GameObject } from "../types/gameObject";
import { type Player } from "./player";
import { type Game } from "../game";
import { randomFloat } from "../../../common/src/utils/random";
import { distance } from "../../../common/src/utils/math";
import { type GunDefinition } from "../../../common/src/definitions/guns";

export class Bullet {
    readonly is: CollisionFilter = {
        player: false,
        obstacle: false,
        bullet: true
    };

    readonly collidesWith: CollisionFilter = {
        player: true,
        obstacle: true,
        bullet: false
    };

    initialPosition: Vec2;
    rotation: number;

    speedVariance = 0;

    maxDistance: number;

    dead = false;

    body: Body;

    source: GunDefinition;
    shooter: Player;

    constructor(game: Game, position: Vec2, rotation: number, source: GunDefinition, shooter: Player) {
        this.initialPosition = position;
        this.rotation = rotation;
        this.source = source;
        this.shooter = shooter;

        const definition = this.source.ballistics;

        // explosion shrapnel variance
        this.speedVariance = randomFloat(0, definition.speedVariance);
        this.maxDistance = definition.maxDistance * (this.speedVariance + 1);

        // Init body
        this.body = game.world.createBody({
            type: "dynamic",
            position,
            fixedRotation: true,
            bullet: true
        });

        this.body.createFixture({
            shape: Circle(0),
            friction: 0.0,
            density: 0.0,
            restitution: 0.0,
            userData: this
        });

        this.body.setMassData({
            I: 0,
            center: Vec2(0, 0),
            mass: 0.0
        });

        this.body.setLinearVelocity(Vec2(Math.sin(rotation), Math.cos(rotation)).mul(definition.speed * (this.speedVariance + 1)));
    }

    get position(): Vec2 {
        return this.initialPosition;
    }

    get distance(): number {
        return distance(this.initialPosition, this.body.getPosition());
    }
}

export class DamageRecord {
    damaged: GameObject;
    damager: Player | undefined;
    bullet: Bullet;

    constructor(damaged: GameObject, damager: Player | undefined, bullet: Bullet) {
        this.damaged = damaged;
        this.damager = damager;
        this.bullet = bullet;
    }
}
