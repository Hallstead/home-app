import express from 'express';
import * as peopleService from '../services/people-service';
import { Pet } from '../models/Pet';

export const peopleRouter = express.Router();

/*
    http://localhost:3000/people
    Retrieves an array of people from database
*/
peopleRouter.get('', (request, response, next) => {
    peopleService.getAllPeople().then(people => {
        response.set('content-type', 'application/json');
        response.json(people);
        next();
    }).catch(err => {
        response.sendStatus(500);
    });
});

peopleRouter.get('/hello', (request, response, next) => {
    response.json({message: "Hello and goodbye!"})
})
/*
    http://localhost:3000/people/1
    Retrieves a single person from the database by id
    If the person does not exist, sends 404
*/
peopleRouter.get('/:id', (request, response, next) => {
    const id = +request.params.id;
    peopleService.getPersonById(id).then(person => {
        if (!person) {
            response.sendStatus(404);
        } else {
            response.json(person);
        }
        next();
    }).catch(err => {
        console.log(err);
        response.sendStatus(500);
        next();
    })
});

/*
* GET /people/{id}/pets - Array of pets owned by that user
* or 404 if the user does not exist
*/
peopleRouter.get('/:id/pets', async (request, response, next) => {
    const id: number = parseInt(request.params.id);

    let pets: Pet[];

    try {
        pets = await peopleService.getPetsByPersonId(id);
    } catch (err) {
        response.sendStatus(500);
        console.log(err);
        return;
    }

    // Dao returns undefined for non-existent person
    if (!pets) {
        response.sendStatus(404);
    } else {
        response.json(pets);
    }
    next();
});

/*
    POST http://localhost:3000/people
    Creates a new person and saves them to the database.
    Returns the inserted data as JSON with status 201.
*/
peopleRouter.post('', (request, response, next) => {
    const person = request.body;
    peopleService.savePerson(person)
        .then(newPerson => {
            response.status(201);
            response.json(newPerson);
            next();
        }).catch(err => {
            response.sendStatus(500);
            next();
        });
});

/* PATCH is an HTTP method that serves as partial replacement */
peopleRouter.patch('', (request, response, next) => {
    const person = request.body;
    peopleService.patchPerson(person)
        .then(updatedPerson => {
            if (updatedPerson) {
                response.json(updatedPerson);
            } else {
                response.sendStatus(404);
            }
        }).catch(err => {
            response.sendStatus(500);
        }).finally(() => {
            next();
        })
});