export interface Book {
    id: number;
    title: string;
    author: string;
    coverUrl: string;
    status: "reading" | "read" | "chose not to finish" | "";
    rating?: number;
    buyLink?: string;
}

export const books: Book[] = [
    {
        id: 1,
        title: "Percy Jackson and the Lightning Thief",
        author: "Rick Riordan",
        coverUrl: "https://covers.openlibrary.org/b/title/Percy%20Jackson%20and%20the%20Lightning%20Thief-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Percy+Jackson+and+the+Lightning+Thief"
    },
    {
        id: 2,
        title: "Percy Jackson and the Sea of Monsters",
        author: "Rick Riordan",
        coverUrl: "https://covers.openlibrary.org/b/title/Percy%20Jackson%20and%20the%20Sea%20of%20Monsters-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Percy+Jackson+and+the+Sea+of+Monsters"
    },
    {
        id: 3,
        title: "Percy Jackson and the Titan’s Curse",
        author: "Rick Riordan",
        coverUrl: "https://covers.openlibrary.org/b/title/Percy%20Jackson%20and%20the%20Titan%27s%20Curse-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Percy+Jackson+and+the+Titan%27s+Curse"
    },
    {
        id: 4,
        title: "Percy Jackson and the Battle of the Labyrinth",
        author: "Rick Riordan",
        coverUrl: "https://covers.openlibrary.org/b/title/Percy%20Jackson%20and%20the%20Battle%20of%20the%20Labyrinth-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Percy+Jackson+and+the+Battle+of+the+Labyrinth"
    },
    {
        id: 5,
        title: "Percy Jackson and the Last Olympian",
        author: "Rick Riordan",
        coverUrl: "https://covers.openlibrary.org/b/title/Percy%20Jackson%20and%20the%20Last%20Olympian-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Percy+Jackson+and+the+Last+Olympian"
    },

    {
        id: 6,
        title: "The Lost Hero",
        author: "Rick Riordan",
        coverUrl: "https://covers.openlibrary.org/b/title/The%20Lost%20Hero-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=The+Lost+Hero+Rick+Riordan"
    },
    {
        id: 7,
        title: "The Son of Neptune",
        author: "Rick Riordan",
        coverUrl: "https://covers.openlibrary.org/b/title/The%20Son%20of%20Neptune-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=The+Son+of+Neptune+Rick+Riordan"
    },
    {
        id: 8,
        title: "The Mark of Athena",
        author: "Rick Riordan",
        coverUrl: "https://covers.openlibrary.org/b/title/The%20Mark%20of%20Athena-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=The+Mark+of+Athena+Rick+Riordan"
    },
    {
        id: 9,
        title: "The House of Hades",
        author: "Rick Riordan",
        coverUrl: "https://m.media-amazon.com/images/I/81kVHR2Zv2L._SL1500_.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=The+House+of+Hades+Rick+Riordan"
    },
    {
        id: 10,
        title: "The Blood of Olympus",
        author: "Rick Riordan",
        coverUrl: "https://covers.openlibrary.org/b/title/The%20Blood%20of%20Olympus-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=The+Blood+of+Olympus+Rick+Riordan"
    },

    {
        id: 11,
        title: "Harry Potter and the Philosopher’s Stone",
        author: "J.K. Rowling",
        coverUrl: "https://covers.openlibrary.org/b/title/Harry%20Potter%20and%20the%20Philosopher%27s%20Stone-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Harry+Potter+and+the+Philosopher%27s+Stone"
    },
    {
        id: 12,
        title: "Harry Potter and the Chamber of Secrets",
        author: "J.K. Rowling",
        coverUrl: "https://covers.openlibrary.org/b/title/Harry%20Potter%20and%20the%20Chamber%20of%20Secrets-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Harry+Potter+and+the+Chamber+of+Secrets"
    },
    {
        id: 13,
        title: "Harry Potter and the Prisoner of Azkaban",
        author: "J.K. Rowling",
        coverUrl: "https://covers.openlibrary.org/b/title/Harry%20Potter%20and%20the%20Prisoner%20of%20Azkaban-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Harry+Potter+and+the+Prisoner+of+Azkaban"
    },
    {
        id: 14,
        title: "Harry Potter and the Goblet of Fire",
        author: "J.K. Rowling",
        coverUrl: "https://covers.openlibrary.org/b/title/Harry%20Potter%20and%20the%20Goblet%20of%20Fire-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Harry+Potter+and+the+Goblet+of+Fire"
    },
    {
        id: 15,
        title: "Harry Potter and the Order of the Phoenix",
        author: "J.K. Rowling",
        coverUrl: "https://covers.openlibrary.org/b/title/Harry%20Potter%20and%20the%20Order%20of%20the%20Phoenix-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Harry+Potter+and+the+Order+of+the+Phoenix"
    },
    {
        id: 16,
        title: "Harry Potter and the Half-Blood Prince",
        author: "J.K. Rowling",
        coverUrl: "https://covers.openlibrary.org/b/title/Harry%20Potter%20and%20the%20Half-Blood%20Prince-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Harry+Potter+and+the+Half-Blood+Prince"
    },
    {
        id: 17,
        title: "Harry Potter and the Deathly Hallows",
        author: "J.K. Rowling",
        coverUrl: "https://covers.openlibrary.org/b/title/Harry%20Potter%20and%20the%20Deathly%20Hallows-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Harry+Potter+and+the+Deathly+Hallows"
    },
    {
        id: 18,
        title: "The Hidden Oracle",
        author: "Rick Riordan",
        coverUrl: "https://m.media-amazon.com/images/I/91s7YixhFCL._SL1500_.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=The+Hidden+Oracle+Rick+Riordan"
    },
    {
        id: 19,
        title: "The Dark Prophecy",
        author: "Rick Riordan",
        coverUrl: "https://covers.openlibrary.org/b/title/The%20Dark%20Prophecy-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=The+Dark+Prophecy+Rick+Riordan"
    },
    {
        id: 20,
        title: "The Burning Maze",
        author: "Rick Riordan",
        coverUrl: "https://covers.openlibrary.org/b/title/The%20Burning%20Maze-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=The+Burning+Maze+Rick+Riordan"
    },
    {
        id: 21,
        title: "The Tyrant’s Tomb",
        author: "Rick Riordan",
        coverUrl: "https://covers.openlibrary.org/b/title/The%20Tyrant%27s%20Tomb-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=The+Tyrant%27s+Tomb+Rick+Riordan"
    },
    {
        id: 22,
        title: "The Tower of Nero",
        author: "Rick Riordan",
        coverUrl: "https://covers.openlibrary.org/b/title/The%20Tower%20of%20Nero-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=The+Tower+of+Nero+Rick+Riordan"
    },
    {
        id: 23,
        title: "The Red Pyramid",
        author: "Rick Riordan",
        coverUrl: "https://covers.openlibrary.org/b/title/The%20Red%20Pyramid-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=The+Red+Pyramid+Rick+Riordan"
    },
    {
        id: 24,
        title: "The Throne of Fire",
        author: "Rick Riordan",
        coverUrl: "https://covers.openlibrary.org/b/title/The%20Throne%20of%20Fire-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=The+Throne+of+Fire+Rick+Riordan"
    },
    {
        id: 25,
        title: "The Serpent’s Shadow",
        author: "Rick Riordan",
        coverUrl: "https://m.media-amazon.com/images/I/517Tkr62MWL.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=The+Serpent%27s+Shadow+Rick+Riordan"
    },
    {
        id: 26,
        title: "The Sword of Summer",
        author: "Rick Riordan",
        coverUrl: "https://m.media-amazon.com/images/I/51U1iqTVz-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=The+Sword+of+Summer+Rick+Riordan"
    },
    {
        id: 27,
        title: "The Hammer of Thor",
        author: "Rick Riordan",
        coverUrl: "https://covers.openlibrary.org/b/title/The%20Hammer%20of%20Thor-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=The+Hammer+of+Thor+Rick+Riordan"
    },
    {
        id: 28,
        title: "The Ship of the Dead",
        author: "Rick Riordan",
        coverUrl: "https://covers.openlibrary.org/b/title/The%20Ship%20of%20the%20Dead-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=The+Ship+of+the+Dead+Rick+Riordan"
    },
    {
        id: 29,
        title: "Aru Shah and the End of Time",
        author: "Roshani Chokshi",
        coverUrl: "https://covers.openlibrary.org/b/title/Aru%20Shah%20and%20the%20End%20of%20Time-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Aru+Shah+and+the+End+of+Time"
    },
    {
        id: 30,
        title: "Aru Shah and the Song of Death",
        author: "Roshani Chokshi",
        coverUrl: "https://covers.openlibrary.org/b/title/Aru%20Shah%20and%20the%20Song%20of%20Death-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Aru+Shah+and+the+Song+of+Death"
    },
    {
        id: 31,
        title: "Aru Shah and the Tree of Wishes",
        author: "Roshani Chokshi",
        coverUrl: "https://covers.openlibrary.org/b/title/Aru%20Shah%20and%20the%20Tree%20of%20Wishes-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Aru+Shah+and+the+Tree+of+Wishes"
    },
    {
        id: 32,
        title: "Aru Shah and the City of Gold",
        author: "Roshani Chokshi",
        coverUrl: "https://covers.openlibrary.org/b/title/Aru%20Shah%20and%20the%20City%20of%20Gold-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Aru+Shah+and+the+City+of+Gold"
    },
    {
        id: 33,
        title: "Aru Shah and the Nectar of Immortality",
        author: "Roshani Chokshi",
        coverUrl: "https://covers.openlibrary.org/b/title/Aru%20Shah%20and%20the%20Nectar%20of%20Immortality-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Aru+Shah+and+the+Nectar+of+Immortality"
    },
    {
        id: 34,
        title: "Tristan Strong Punches a Hole in the Sky",
        author: "Kwame Mbalia",
        coverUrl: "https://covers.openlibrary.org/b/title/Tristan%20Strong%20Punches%20a%20Hole%20in%20the%20Sky-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Tristan+Strong+Punches+a+Hole+in+the+Sky"
    },
    {
        id: 35,
        title: "Tristan Strong Destroys the World",
        author: "Kwame Mbalia",
        coverUrl: "https://m.media-amazon.com/images/I/91f0+UzT+qL._SL1500_.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Tristan+Strong+Destroys+the+World"
    },
    {
        id: 36,
        title: "Tristan Strong Keeps Punching",
        author: "Kwame Mbalia",
        coverUrl: "https://covers.openlibrary.org/b/title/Tristan%20Strong%20Keeps%20Punching-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=Tristan+Strong+Keeps+Punching"
    },
    {
        id: 37,
        title: "The Storm Runner",
        author: "J.C. Cervantes",
        coverUrl: "https://m.media-amazon.com/images/I/91ghQ-e-o9L._SL1500_.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=The+Storm+Runner+J+C+Cervantes"
    },
    {
        id: 38,
        title: "The Fire Keeper",
        author: "J.C. Cervantes",
        coverUrl: "https://covers.openlibrary.org/b/title/The%20Fire%20Keeper-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=The+Fire+Keeper+J+C+Cervantes"
    },
    {
        id: 39,
        title: "The Shadow Crosser",
        author: "J.C. Cervantes",
        coverUrl: "https://covers.openlibrary.org/b/title/The%20Shadow%20Crosser-L.jpg",
        status: "read",
        buyLink: "https://www.amazon.in/s?k=The+Shadow+Crosser+J+C+Cervantes"
    },
];