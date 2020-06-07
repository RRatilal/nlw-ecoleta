import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
    async index(req: Request, res: Response) {
        const { city, uf, itens } = req.query;

        const parsedItens = String(itens)
            .split(',')
            .map(item => Number(item.trim()));

        const points = await knex("points")
            .join('point_itens', 'points.id', '=', 'point_itens.point_id')
            .whereIn('point_itens.item_id', parsedItens)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        const serializedIPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.43.251:3333/uploads/${point.image}`
            }
        })

        return res.json(serializedIPoints)
    }

    async show(req: Request, res: Response) {
        const { id } = req.params;

        const point = await knex('points').where('id', id).first();

        if (!point) {
            return res.status(400).json({ message: "Point not found." })
        }

        const serializedIPoint = {
            ...point,
            image_url: `http://192.168.43.251:3333/uploads/${point.image}`
        };

        const itens = await knex('itens')
            .join('point_itens', 'itens.id', '=', 'point_itens.item_id')
            .where('point_itens.point_id', id)
            .select('itens.title');

        return res.json({ point: serializedIPoint, itens })
    }

    async create(req: Request, res: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            itens
        } = req.body;

        const trx = await knex.transaction();

        const point = {
            image: req.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }

        const insertedIds = await trx('points').insert(point);

        const point_id = insertedIds[0]

        const pointItens = itens
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map((item_id: number) => {
                return {
                    item_id,
                    point_id,
                }
            })

        await trx('point_itens').insert(pointItens);

        await trx.commit();

        return res.json({
            id: point_id,
            ...point
        })
    }
}

export default PointsController;