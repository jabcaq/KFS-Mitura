// Centralne miejsce dla wszystkich tekstów w aplikacji
export const TEXTS = {
    // Opcje formularza
    SELECT_PLACEHOLDER: "Wybierz...",

    // Płcie
    GENDER: {
        MALE: "Mężczyzna",
        FEMALE: "Kobieta"
    },

    // Wykształcenie
    EDUCATION: {
        PRIMARY: "Podstawowe",
        MIDDLE: "Gimnazjalne",
        VOCATIONAL: "Zasadnicze zawodowe",
        SECONDARY_GENERAL: "Średnie ogólnokształcące",
        SECONDARY_VOCATIONAL: "Średnie zawodowe",
        POST_SECONDARY: "Policealne",
        HIGHER: "Wyższe"
    },

    // Rodzaje umów
    CONTRACT_TYPE: {
        EMPLOYMENT: "Umowa o pracę",
        MANDATE: "Umowa zlecenie",
        SPECIFIC_WORK: "Umowa o dzieło",
        B2B: "Kontrakt B2B",
        APPOINTMENT: "Powołanie",
        OWNER: "Brak - właściciel firmy",
        OTHER: "Inne"
    },

    // Wielkości podmiotu
    COMPANY_SIZE: {
        MICRO: "Mikro",
        SMALL: "Mały",
        MEDIUM: "Średni",
        LARGE: "Duży",
        OTHER: "Inne"
    },

    // Opcje TAK/NIE
    YES_NO: {
        YES: "TAK",
        NO: "NIE"
    },

    // Etykiety pól
    LABELS: {
        COMPANY_NAME: "Nazwa podmiotu",
        NAME: "Imię i nazwisko",
        GENDER: "Płeć",
        BIRTH_DATE: "Data urodzenia",
        EDUCATION: "Wykształcenie",
        POSITION: "Stanowisko",
        CONTRACT_TYPE: "Rodzaj umowy",
        CONTRACT_START: "Od kiedy",
        CONTRACT_END: "Do kiedy",
        REPRESENTATIVE_PHONE: "Telefon reprezentanta",
        CONTACT_PHONE: "Telefon kontaktowy",
        CONTACT_EMAIL: "E-mail kontaktowy",
        TOTAL_EMPLOYEES: "Łączna liczba pracowników",
        PLANNED_EMPLOYEE_COUNT: "Ilość osób do przeszkolenia"
    },

    // Przyciski
    BUTTONS: {
        SAVE_EMPLOYEE: "Zapisz pracownika",
        ADD_EMPLOYEE: "Dodaj pracownika",
        CANCEL: "Anuluj",
        SUBMIT: "Wyślij dane",
        NEXT: "Dalej",
        PREVIOUS: "Wstecz"
    },

    // Komunikaty błędów
    ERRORS: {
        REQUIRED: "Pole wymagane",
        EMPLOYEE_COUNT_TOO_FEW: (current: number, required: number) =>
            `Dodano ${current} pracowników, wymagane: ${required}. Dodaj jeszcze ${required - current} pracowników.`,
        EMPLOYEE_COUNT_TOO_MANY: (current: number, required: number) =>
            `Dodano ${current} pracowników, wymagane: ${required}. Usuń ${current - required} pracowników.`,
        EMPLOYEE_COUNT_INVALID: "Liczba osób do przeszkolenia musi być liczbą większą od 0"
    },

    // Placeholdery
    PLACEHOLDERS: {
        DATE: "dd.mm.rrrr",
        NIP: "np. 123-456-78-90",
        PKD: "np. 62.01.Z",
        BANK_NAME: "np. PKO Bank Polski",
        ACCOUNT_NUMBER: "26 cyfr numeru konta",
        NAME: "Imię i nazwisko",
        CORRESPONDENCE_ADDRESS: "Adres do korespondencji",
        PHONE: "+48 123 456 789",
        EMAIL: "nazwa@domena.pl",
        BIRTH_DATE: "RRRR-MM-DD",
        EMPLOYEE_COUNT: "np. 15"
    },

    // Sekcje
    SECTIONS: {
        COMPANY_DATA: "Dane podmiotu"
    }
} as const;