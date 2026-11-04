/* The interface language of the atlas as players see it. English strings are the keys; a missing one stays English.
 * The Storyteller's editor stays in English. */
let LANG = 'en';
export function setLang(l) { LANG = l === 'ru' ? 'ru' : 'en'; }
export function lang() { return LANG; }
/** Translate a phrase; {name}-style placeholders are filled from vars. */
export function t(s, vars) {
  let r = (LANG === 'ru' && RU[s]) || s;
  if (vars) r = r.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  return r;
}

const RU = {
  // map controls
  'Add a note to the map': 'Добавить заметку на карту', 'Categories': 'Категории', 'Close': 'Закрыть', 'Dossier': 'Досье', 'Edit': 'Править', 'Edit the atlas': 'Править атлас',
  'Edit the shape and details': 'Править форму и подробности', 'Find on the map': 'Найти на карте', 'Hidden from players until you reveal it': 'Скрыто от игроков, пока вы не откроете',
  'Hide or show the atlas on the scene': 'Скрыть или показать атлас на сцене', 'Level': 'Уровень', 'Map': 'Карта', 'Map layers': 'Слои карты', 'Place on the map: click where they are': 'Поставить на карту: щёлкните, где персонаж',
  'Realm': 'Мир', 'Remove this relation': 'Убрать это отношение', 'Search every layer': 'Искать по всем слоям', 'Search every layer ( / )': 'Искать по всем слоям ( / )',
  'Search every layer: people, places, zones…': 'Поиск по всем слоям: люди, места, зоны…', 'Show as a Scene: make (or update) a Foundry scene of this atlas': 'Показать как сцену: создать (или обновить) сцену Foundry из атласа',
  'Show or hide on the map': 'Показать или скрыть на карте', 'Show or hide the dossier': 'Показать или скрыть досье', 'Show or hide this domain on the map': 'Показать или скрыть этот домен на карте',
  'Show the whole map': 'Показать всю карту', 'Show this entry to the players': 'Показать эту запись игрокам', 'Show this view to the players': 'Показать этот вид игрокам', 'Take off the map': 'Убрать с карты',
  'What is here?': 'Что здесь?', 'What others believe; choose per player under What players see': 'Во что верят другие; для каждого игрока — в «Что видят игроки»', 'Where the characters are': 'Где персонажи',
  'Who can read this page': 'Кто может читать эту страницу', 'Your notes…': 'Ваши заметки…', 'Zoom in': 'Приблизить', 'Zoom out': 'Отдалить', 'Attitude (e.g. Hatred, Ally)': 'Отношение (напр. Ненависть, Союзник)',
  // dossier
  'Allegiance unknown': 'Принадлежность неизвестна', 'Callout': 'Выноска', 'Character sheet': 'Лист персонажа', 'Claimed by': 'Чьи владения', 'Close by': 'Поблизости', 'Ends': 'Концы пути',
  'Figures here': 'Здесь бывают', 'Go to anchor': 'К якорю', 'Go to the scene': 'Перейти на сцену', 'Inside': 'Внутри', 'Lies within': 'Находится в', 'Open linked document': 'Открыть связанный документ',
  'Relations': 'Отношения', 'Routes': 'Пути', 'See also': 'См. также', 'Where to find them': 'Где их найти', 'How others see them': 'Как их видят другие', 'No relations yet.': 'Отношений пока нет.',
  'Nothing more is known yet.': 'Больше пока ничего не известно.', 'Source: ': 'Источник: ', 'Secret': 'Тайна', 'Fact': 'Факт', 'Note': 'Заметка', 'Notes': 'Заметки', 'Rating': 'Уровень',
  'Here now': 'Сейчас здесь', 'Search {what}…': 'Поиск: {what}…', 'Back to {what}': 'Назад: {what}', 'The linked Actor no longer exists.': 'Связанного актёра больше нет.',
  'Zone': 'Зона', 'Route': 'Путь', 'Glow': 'Сияние', 'Label': 'Надпись', 'Page': 'Страница', 'Faction': 'Фракция', 'Category': 'Категория', 'Layer': 'Слой',
  'Person': 'Персона', 'Place': 'Место', 'Phenomenon': 'Явление', 'Other': 'Другое', 'Domain': 'Домен', 'Unaffiliated': 'Без принадлежности',
  'Someone': 'Кто-то', 'Something strange': 'Что-то странное', 'Unknown': 'Неизвестно', 'Unknown area': 'Неизвестная область', 'Unknown figure': 'Неизвестный', 'Unknown place': 'Неизвестное место', 'Unknown way': 'Неизвестный путь',
  'You have heard of them, but know nothing more.': 'Вы слышали о нём, но больше ничего не знаете.', 'You know something is here, but nothing more.': 'Вы знаете, что здесь что-то есть, — и только.',
  // lists, map tab, search
  'All': 'Все', 'Colour': 'Цвет', 'Icon': 'Значок', 'Legend': 'Легенда', 'Layers ': 'Слои ', 'Characters ': 'Персонажи ', 'My notes ': 'Мои заметки ', 'Shared by others ': 'От других ',
  'No layers here.': 'Здесь нет слоёв.', 'No layers yet.': 'Слоёв пока нет.', 'No one by that name.': 'Никого с таким именем.', 'No player accounts yet.': 'Учётных записей игроков пока нет.',
  'No zones or routes here yet.': 'Здесь пока нет зон и путей.', 'None yet.': 'Пока ничего.', 'Notes are not available here.': 'Заметки здесь недоступны.',
  'Notes are yours: the Storyteller’s map stays as it is. Choose “Everyone” to share a note with the group.': 'Заметки — ваши: карта Рассказчика не меняется. Выберите «Все», чтобы поделиться заметкой с группой.',
  'Notes others share': 'Заметки других', 'Nothing found.': 'Ничего не найдено.', 'Nothing here yet': 'Здесь пока пусто', 'Nothing matches. Clear the search or switch a category back on.': 'Ничего не подходит. Очистите поиск или включите категорию.',
  'Places shown': 'Показанные места', 'Type to search every realm and level: places, zones, routes and people.': 'Начните вводить: поиск по всем мирам и уровням — места, зоны, пути, люди.',
  'Hidden (see the Map tab).': 'Скрыто (см. вкладку «Карта»).', 'Hide from the other players': 'Скрыть от других игроков', 'Show to the other players': 'Показать другим игрокам',
  'Drag a portrait on the map to move it. ': 'Перетащите портрет по карте, чтобы переместить. ', 'Drag your portrait on the map to move it. ': 'Перетащите свой портрет по карте, чтобы переместить его. ',
  'Drop it on a place to go inside.': 'Бросьте его на место — персонаж войдёт внутрь.', "Portraits come from each player's character.": 'Портреты берутся из персонажей игроков.', 'inside: {place}': 'внутри: {place}', 'hidden from the others': 'скрыт от остальных',
  'Click on the map where {name} is (Esc to cancel).': 'Щёлкните на карте, где находится {name} (Esc — отмена).', 'the character': 'персонаж', 'not on the map': 'не на карте', 'hidden': 'скрыт',
  'Click on the map where the note goes (Esc to cancel).': 'Щёлкните на карте, куда поставить заметку (Esc — отмена).', 'Could not save the note: ': 'Не удалось сохранить заметку: ',
  'Delete note': 'Удалить заметку', 'New note': 'Новая заметка', 'Your note': 'Ваша заметка', 'Your note · everyone sees it': 'Ваша заметка · видят все', 'Your note · only you': 'Ваша заметка · только вы',
  'Everyone': 'Все', 'Text': 'Текст', 'Title': 'Заголовок', 'Who…': 'Кто…', 'The Storyteller hasn’t revealed this map to you.': 'Рассказчик ещё не открыл вам эту карту.',
  'The Storyteller hasn\'t revealed this map to you.': 'Рассказчик ещё не открыл вам эту карту.',
  // realm controls on scenes (Storyteller sees them too)
  'Hide the atlas': 'Скрыть атлас', 'Show the atlas': 'Показать атлас', 'Open the atlas in a window': 'Открыть атлас в окне', 'Open the full atlas window (to edit)': 'Открыть полное окно атласа (для правки)',
  'Players follow your realm and level (click to let them switch freely)': 'Игроки следуют за вашим миром и уровнем (щёлкните, чтобы они переключали сами)',
  'Players switch realms themselves (click to make them follow you)': 'Игроки сами переключают миры (щёлкните, чтобы они следовали за вами)', 'The Storyteller chooses the realm on this scene': 'На этой сцене мир выбирает Рассказчик',
  'Players follow my realm': 'Игроки следуют за моим миром', 'Draw a domain': 'Нарисовать домен', 'Draw another domain': 'Нарисовать ещё домен',
  // tiers and view-as (Storyteller)
  'Hidden from players': 'Скрыто от игроков', 'Hide from all': 'Скрыть от всех', 'View': 'Вид', 'View as': 'Смотреть как', 'Storyteller': 'Рассказчик', 'Storyteller (everything)': 'Рассказчик (всё)',
  'Centre on map': 'Показать на карте', 'Note by {who}': 'Заметка: {who}', 'someone': 'кто-то', 'private': 'личная', 'Delete this note': 'Удалить заметку',
  'shared with everyone': 'видят все', 'only you': 'только вы', 'of {n}': 'из {n}',
  'Every player (defaults)': 'Все игроки (по умолчанию)', 'This player': 'Этот игрок', "Players' private notes": 'Личные заметки игроков'
};
