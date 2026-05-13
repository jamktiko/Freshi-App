# Freshi käyttäjätestit

## Testauksen tavoite

Varmistaa, että Freshi toimii luotettavasti usealla laitteella ja että:

- tuotteiden lisäys toimii
- tuotteiden poisto toimii
- tuotteiden synkronointi toimii
- AI-toiminnallisuudet toimivat
- rekisteröinti ja kirjautuminen toimivat
- perus UI-toiminnot toimivat oikein
- eri käyttäjien data pysyy erillään

---

# Testiympäristö

| Laite | Käyttöjärjestelmä | Käyttäjä |
|---|---|---|
| Android-puhelin | Android | Käyttäjä A |
| Selain / emulaattori | Web / Ionic | Käyttäjä A |
| Toinen puhelin | Android | Käyttäjä B |

> Käyttäjä A kirjautuu samalla tunnuksella usealle laitteelle synkkaustestejä varten.

---

# 1. Rekisteröinti

## Testi 1.1 — Uuden käyttäjän rekisteröinti

### Vaiheet

1. Avaa Freshi
2. Valitse rekisteröinti
3. Syötä:
   - sähköposti
   - salasana
   - salasanan konfirmointi
4. Lähetä lomake

### Odotettu tulos

- Käyttäjä luodaan onnistuneesti
- Käyttäjä kirjautuu sisään automaattisesti
- Käyttäjällä ei ole tuotteita ensimmäisellä kirjautumiskerralla
- Virheilmoitus näkyy, jos sähköposti on jo käytössä

---

# 2. Kirjautuminen

## Testi 2.1 — Kirjautuminen oikeilla tunnuksilla

### Vaiheet

1. Avaa appi
2. Valitse kirjautuminen
3. Syötä sähköposti ja salasana
4. Kirjaudu sisään

### Odotettu tulos

- Kirjautuminen onnistuu
- Käyttäjä näkee omat tuotteensa
- Sama data näkyy kirjauduttaessa eri laitteilla

---

## Testi 2.2 — Kirjautuminen väärällä salasanalla

### Vaiheet

1. Syötä väärä salasana
2. Yritä kirjautua

### Odotettu tulos

- Kirjautuminen estetään
- Näytetään selkeä virheilmoitus
- Appi ei jää lataustilaan tai muuhun epäselkeään vaiheeseen

---

# 3. Tuotteen lisäys

## Testi 3.1 — Tuotteen lisääminen manuaalisesti

### Vaiheet

1. Kirjaudu sisään
2. Paina + -kuvaketta
3. Lisää uusi tuote:
   - nimi
   - brändi
   - kategoria
   - päiväys
4. Tallenna tuote

### Odotettu tulos

- Tuote ilmestyy listalle
- Tuotteen tiedot ovat oikein
- Tuote tallentuu tietokantaan

---

## Testi 3.2 — Tuotteen lisääminen tekoälyavusteisesti

### Vaiheet

1. Kirjaudu sisään
2. Paina + -kuvaketta
3. Paina kamera -kuvaketta
4. Ota tuotteestasi kuva
5. Hyväksy ottamasi kuva
6. Paina "AUTOFILL FROM IMAGE" -näppäintä
7. Tarkista tekoälyn palauttamat tiedot
8. Tallenna tuote

### Odotettu tulos

- Tekoäly palauttaa tuotteeseen liittyvät tiedot
- Tuotteen tietoja voi vielä manuaalisesti muokata tekoälytoiminnon jälkeen ennen tallennusta
- Tuote ilmestyy listalle
- Tuotteen tiedot ovat oikein
- Tuote tallentuu tietokantaan

---

# 4. Tuotteiden synkronointi usealla laitteella

## Testi 4.1 — Tuote näkyy toisella laitteella

### Vaiheet

1. Kirjaudu samalla käyttäjällä:
   - laitteelle 1
   - laitteelle 2
2. Lisää uusi tuote laitteella 1
3. Tarkista laite 2

### Odotettu tulos

- Tuote näkyy laitteella 2
- Synkkaus toimii automaattisesti tai refreshin jälkeen
- Tuotetiedot ovat identtiset

---

## Testi 4.2 — Tuotteen muokkaus synkronoituna

### Vaiheet

1. Lisää tuote laitteella 1
2. Muokkaa tuotetta laitteella 2
3. Tarkista laite 1

### Odotettu tulos

- Muutokset näkyvät molemmilla laitteilla
- Vanha tieto ei jää näkyviin
- Duplikaatteja ei synny

---

## Testi 4.3 — Tuotteen poisto synkronoituna

### Vaiheet

1. Lisää tuote laitteella 1
2. Poista tuote laitteella 2
3. Tarkista laite 1

### Odotettu tulos

- Tuote poistuu kaikilta laitteilta
- Poistettu tuote ei palaa takaisin

---

## Testi 4.4 — Samanaikainen muokkaus kahdella laitteella

### Vaiheet

1. Avaa sama tuote laitteella 1 ja 2
2. Muokkaa tuotetta molemmilla laitteilla
3. Tallenna muutokset lähes samaan aikaan

### Odotettu tulos

- Konfliktit käsitellään hallitusti
- Data ei korruptoidu
- Appi ei kaadu

---

# 5. Offline- ja verkkokatkostestit

## Testi 5.1 — Tuotteen lisäys ilman internetiä

### Vaiheet

1. Kirjaudu sisään
2. Katkaise internet
3. Lisää uusi tuote
4. Palauta internet

### Odotettu tulos

- Käyttäjä saa selkeän ilmoituksen
- Offline-data synkronoituu yhteyden palautuessa
- Tuote ei katoa

---

## Testi 5.2 — Tuotteen poisto offline-tilassa

### Odotettu tulos

- Poisto estetään tai synkronoidaan myöhemmin
- Data pysyy yhtenäisenä kaikilla laitteilla

---

# 6. AI-toiminnallisuus

## Testi 6.1 — AI virhetilanteessa

### Vaiheet

1. Katkaise internet
2. Käytä AI-toimintoa

### Odotettu tulos

- Näytetään ymmärrettävä virheilmoitus
- Appi ei jää lataamaan loputtomasti
- Appi ei kaadu

---

# 7. Perus UI-toiminnallisuudet

## Testi 7.1 — Navigointi

### Testattavat näkymät

- Etusivu
- Tuotelista
- Tuotteen lisäys
- Tuotteen muokkaus
- Asetukset
- Kirjautuminen ulos
- Takaisin-painike
- Hamburger-menu


### Odotettu tulos

- Navigointi toimii ilman virheitä
- Takaisin-painike toimii oikein
- Lataus- ja tyhjät tilat näkyvät oikein

---

## Testi 7.2 — Lomakevalidointi

### Testaa

- Tyhjä tuotteen nimi
- Virheellinen päivämäärä
- Liian pitkä nimi
- Erikoismerkit

### Odotettu tulos

- Virheilmoitukset näkyvät selkeästi
- Virheellistä dataa ei tallenneta
- Appi ei kaadu

---

# 8. Kirjautuminen ulos

## Testi 8.1 — Logout

### Vaiheet

1. Kirjaudu sisään
2. Kirjaudu ulos
3. Sulje appi
4. Avaa appi uudelleen

### Odotettu tulos

- Käyttäjä pysyy uloskirjautuneena
- Data ei näy ilman kirjautumista

---

# 9. Käyttäjäkohtainen data

## Testi 9.1 — Käyttäjät eivät näe toistensa tuotteita

### Vaiheet

1. Kirjaudu käyttäjällä A
2. Lisää tuotteita
3. Kirjaudu ulos
4. Kirjaudu käyttäjällä B

### Odotettu tulos

- Käyttäjä B ei näe käyttäjän A tuotteita
- Data on käyttäjäkohtaisesti rajattu

---

# 10. Hyväksymiskriteerit

Freshi läpäisee testauksen, jos:

- tuotteiden lisäys toimii
- tuotteiden poisto toimii
- tuotteiden muokkaus toimii
- tuotteet synkronoituvat oikein
- poistettu tuote ei palaa takaisin
- sama käyttäjä näkee saman datan kaikilla laitteilla
- eri käyttäjät eivät näe toistensa dataa
- appi ei kaadu usean yhtäaikaisen muutoksen aikana
- AI-toiminto toimii
- rekisteröinti ja kirjautuminen toimivat
- appi ei jää lataustilaan
- virheilmoitukset ovat ymmärrettäviä
- UI toimii Androidilla

---

# Esimerkkidata

| Tuote | Kategoria | Päiväys |
|---|---|---|
| Maito | Maitotuotteet | Huomenna |
| Banaani | Hedelmät | 3 päivän päästä |
| Kana | Lihatuotteet | Tänään |
| Leipä | Viljatuotteet | 5 päivän päästä |
| Tomaatti | Vihannekset | 2 päivän päästä |

---

# Testiraporttipohja

| Testi | Laite | Käyttäjä | Tulos | Huomiot |
|---|---|---|---|---|
| Tuotteen lisäys | Android/Emulaattori | A | Hyväksytty / Hylätty | |
| Synkkaus toiselle laitteelle | Android/Emulaattori | A | Hyväksytty / Hylätty | |
| Poisto toiselta laitteelta | Android/Emulaattori | A | Hyväksytty / Hylätty | |
| AI-tuotteiden lisäys | Android/Emulaattori | A | Hyväksytty / Hylätty | |
| Käyttäjäkohtainen data | Android/Emulaattori | A/B | Hyväksytty / Hylätty | |
