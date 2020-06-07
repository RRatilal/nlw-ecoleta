import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet'
import api from '../../services/api';

import Dropzone from '../../components/Dropzone'

import './styles.css';

import logo from '../../assets/logo.svg';

interface item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string
}

interface IBGECityResponse {
    nome: string
}

const CreatePoint: React.FC = () => {
    const [itens, setItens] = useState<item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [citys, setCitys] = useState<string[]>([]);

    const [inictialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedUCity, setSelectedCity] = useState('0');
    const [selectedItens, setSelectedItens] = useState<number[]>([])
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [selectedFile, setSelectedFile] = useState<File>()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    })

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;

            setInitialPosition([latitude, longitude])
        })
    }, [])

    useEffect(() => {
        api.get("itens").then(response => {
            setItens(response.data)
        });
    }, []);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);

            setUfs(ufInitials);
        })
    }, []);

    useEffect(() => {
        if (selectedUf === '0') {
            return
        }

        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
            const cityNames = response.data.map(city => city.nome);

            setCitys(cityNames);
        })
    }, [selectedUf]);

    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;

        setSelectedUf(uf);
    }

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;

        setSelectedCity(city);
    }

    function handleMapClic(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng,
        ])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setFormData({ ...formData, [name]: value });
    }

    function handleselectItem(id: number) {
        const alreadySelected = selectedItens.findIndex(item => item === id);

        if (alreadySelected >= 0) {
            const filteredItens = selectedItens.filter(item => item !== id);

            return setSelectedItens(filteredItens);
        }

        return setSelectedItens([...selectedItens, id])
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedUCity;
        const [latitude, longitude] = selectedPosition;
        const itens = selectedItens;

        const data = new FormData();


        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('itens', itens.join(','));

        if (selectedFile) {
            data.append('image', selectedFile);
        }

        await api.post('points', data);

        alert('Ponto de colecta criado!')
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />

                <Link to="/">
                    <FiArrowLeft />
                Voltar para Home
            </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br /> ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereco</h2>
                        <span>Selecione o endereco no mapa</span>
                    </legend>

                    <Map center={inictialPosition} zoom={15} onClick={handleMapClic}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select
                                name="uf"
                                id="uf"
                                value={selectedUf}
                                onChange={handleSelectedUf}
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select
                                name="city"
                                id="city"
                                value={selectedUCity}
                                onChange={handleSelectedCity}
                            >
                                <option value="0">Selecione uma cidade</option>
                                {citys.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens a baixo</span>
                    </legend>

                    <ul className="items-grid">
                        {itens.map(item => (
                            <li
                                key={item.id}
                                onClick={() => handleselectItem(item.id)}
                                className={selectedItens.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt="teste" />
                                <span>{item.title}</span>
                            </li>
                        ))}

                    </ul>
                </fieldset>

                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
}

export default CreatePoint;