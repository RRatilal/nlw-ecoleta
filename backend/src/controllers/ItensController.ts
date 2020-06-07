import { Request, Response } from 'express';
import knex from '../database/connection';

class ItensController {
    async  index(req: Request, res: Response) {
        const itens = await knex('itens').select('*');

        const serializedItens = itens.map(item => {
            return {
                id: item.id,
                title: item.title,
                image_url: `http://192.168.43.251:3333/uploads/${item.image}`
            }
        })

        return res.json(serializedItens);
    }
}

export default ItensController;