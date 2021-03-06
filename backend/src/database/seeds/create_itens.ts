import Knex from 'knex';

export async function seed(knex: Knex) {
    await knex('itens').insert([
        { title: 'lampada', image: "lampadas.svg" },
        { title: 'Pilhas e Baterias', image: "baterias.svg" },
        { title: 'Papeis e papelao', image: "papeis-papelao.svg" },
        { title: 'Residuos Eletronicos', image: "eletronicos.svg" },
        { title: 'Residuos Organicos', image: "organicos.svg" },
        { title: 'Oleo de Cozinha', image: "oleo.svg" },
    ]);
}