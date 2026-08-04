# User Screen Flow: подарочные сертификаты (MVP)

Схема в FigJam: https://www.figma.com/board/w071nBuQgmwXTj8X50H2MH

## Легенда

| Обозначение | Значение |
| --- | --- |
| Белый прямоугольник | Экран, страница, форма, модальное окно, видимое состояние |
| Голубой ромб | Решение или проверка, меняющая путь пользователя |
| Светло-фиолетовый скруглённый | Системное действие |
| Зелёный | Значимый успешный результат |
| Красный | Ошибка |
| Оранжевый | Открытый вопрос PRD |
| Светло-голубой пунктирный | Предположение (в PRD не зафиксировано) |
| Серый пунктирный | Функция вне MVP |
| Белый пунктирный скруглённый | Переход в другой сценарий или точка входа |

Действия пользователя подписаны на стрелках.

## Схема

```mermaid
%%{init: {"flowchart": {"curve": "stepBefore", "nodeSpacing": 30, "rankSpacing": 45}}}%%
flowchart TB

subgraph buyFlow ["1. Покупка сертификата"]
direction TB
  BuyEntry(["Вход: промо, афиша, письмо"]):::transition
  GiftLanding["Экран: Страница сертификатов"]:::screen
  NominalScreen["Экран: Номинал и количество"]:::screen
  CheckLimit(["Система: проверяет лимит выпуска"]):::system
  LimitOk{"Номинал доступен?"}:::decision
  LimitError["Ошибка: номинал недоступен"]:::error
  BuyerForm["Экран: Данные покупателя"]:::screen
  RecipientChoice{"Указать получателя?"}:::decision
  RecipientForm["Экран: Данные получателя"]:::screen
  OrderScreen["Экран: Оформление заказа"]:::screen
  ToPayment(["Переход к сценарию: оплата заказа"]):::transition
  BuyDeferred["Не в MVP: свой дизайн, отложенная отправка"]:::deferred
  BuyQuestion["Открытый вопрос: лимит штук в заказе"]:::question

  BuyEntry --> GiftLanding
  GiftLanding -->|"Открывает выбор"| NominalScreen
  NominalScreen -->|"Выбирает номинал и количество"| CheckLimit
  CheckLimit --> LimitOk
  LimitOk -->|"Нет"| LimitError
  LimitError -->|"Выбирает другой номинал"| NominalScreen
  LimitOk -->|"Да"| BuyerForm
  BuyerForm -->|"Продолжает"| RecipientChoice
  RecipientChoice -->|"Да"| RecipientForm
  RecipientForm -->|"Продолжает"| OrderScreen
  RecipientChoice -->|"Нет"| OrderScreen
  OrderScreen -->|"Переходит к оплате"| ToPayment
  RecipientForm -.-> BuyDeferred
  NominalScreen -.-> BuyQuestion
end

subgraph payFlow ["2. Оплата заказа сертификата"]
direction TB
  PayEntry(["Вход: из оформления заказа"]):::transition
  ReserveIssue(["Система: резервирует выпуск"]):::system
  PayScreen["Экран: Оплата картой"]:::screen
  PayResult{"Оплата прошла?"}:::decision
  PayError["Ошибка: платеж отклонен"]:::error
  ReserveAlive{"Резерв еще действует?"}:::decision
  RetryPay(["Система: повторная попытка"]):::system
  ReleaseReserve(["Система: снимает резерв"]):::system
  ReserveLost["Ошибка: время резерва истекло"]:::error
  BackToBuy(["Переход к сценарию: покупка сертификата"]):::transition
  IssueCerts(["Система: выпускает коды и активирует"]):::system
  PaySuccess["Успешно: заказ оплачен"]:::success
  ToDelivery(["Переход к сценарию: получение сертификата"]):::transition
  PayQuestion["Открытый вопрос: срок резерва выпуска"]:::question

  PayEntry --> ReserveIssue
  ReserveIssue --> PayScreen
  PayScreen -->|"Оплачивает картой"| PayResult
  PayResult -->|"Ошибка"| PayError
  PayError --> ReserveAlive
  ReserveAlive -->|"Да"| RetryPay
  RetryPay --> PayScreen
  ReserveAlive -->|"Нет"| ReleaseReserve
  ReleaseReserve --> ReserveLost
  ReserveLost -->|"Начинает заново"| BackToBuy
  PayResult -->|"Успешно"| IssueCerts
  IssueCerts --> PaySuccess
  PaySuccess --> ToDelivery
  ReserveIssue -.-> PayQuestion
end

subgraph deliveryFlow ["3. Получение сертификата"]
direction TB
  DeliveryEntry(["Вход: после успешной оплаты"]):::transition
  RecipientMode{"Кому отправляем?"}:::decision
  SendBuyer(["Система: письмо покупателю"]):::system
  SendRecipient(["Система: письмо получателю"]):::system
  CertScreen["Экран: Сертификат, код и инструкция"]:::screen
  MailArrived{"Письмо получено?"}:::decision
  MailError["Ошибка: письмо не пришло"]:::error
  ResendCert(["Система: повторная отправка"]):::system
  ResendOk{"Письмо доставлено?"}:::decision
  MailSupport(["Переход к сценарию: поддержка"]):::transition
  DownloadFile(["Система: формирует файл сертификата"]):::system
  CertReady["Успешно: сертификат получен"]:::success
  ToBalance(["Переход к сценарию: проверка баланса"]):::transition
  ToPoster(["Переход к сценарию: выбор события"]):::transition
  DeliveryDeferred["Не в MVP: отложенная отправка, физические карты"]:::deferred
  DeliveryQuestion["Открытый вопрос: доставка по SMS"]:::question

  DeliveryEntry --> RecipientMode
  RecipientMode -->|"Покупателю"| SendBuyer
  RecipientMode -->|"Получателю"| SendRecipient
  SendBuyer --> CertScreen
  SendRecipient --> CertScreen
  CertScreen -->|"Проверяет почту"| MailArrived
  MailArrived -->|"Нет"| MailError
  MailError -->|"Запрашивает повтор"| ResendCert
  ResendCert --> ResendOk
  ResendOk -->|"Нет"| MailSupport
  ResendOk -->|"Да"| CertReady
  MailArrived -->|"Да"| CertReady
  CertScreen -->|"Скачивает файл"| DownloadFile
  DownloadFile --> CertReady
  CertReady --> ToBalance
  CertReady --> ToPoster
  RecipientMode -.-> DeliveryDeferred
  SendRecipient -.-> DeliveryQuestion
end

subgraph balanceFlow ["4. Проверка баланса и статуса"]
direction TB
  BalanceEntry(["Вход: ссылка из письма или ЛК Афиши"]):::transition
  CodeForm["Экран: Проверка сертификата по коду"]:::screen
  CheckCode(["Система: проверяет код"]):::system
  CodeFound{"Код найден?"}:::decision
  CodeMissing["Ошибка: код не найден"]:::error
  AttemptsLeft{"Попытки остались?"}:::decision
  RetryCode(["Система: повторный ввод"]):::system
  LockoutError["Ошибка: слишком много попыток"]:::error
  BalanceSupport(["Переход к сценарию: поддержка"]):::transition
  CertStatus{"Статус сертификата?"}:::decision
  BalanceScreen["Экран: Остаток и история списаний"]:::screen
  SpentScreen["Экран: Баланс исчерпан"]:::screen
  BlockedInfo["Ошибка: сертификат заблокирован"]:::error
  ToEvent(["Переход к сценарию: выбор события"]):::transition
  BuyAgain(["Переход к сценарию: покупка сертификата"]):::transition
  BalanceAssumption["Предположение: проверка без авторизации"]:::assumption
  BalanceQuestion["Открытый вопрос: привязка к личному кабинету"]:::question

  BalanceEntry --> CodeForm
  CodeForm -->|"Вводит код"| CheckCode
  CheckCode --> CodeFound
  CodeFound -->|"Нет"| CodeMissing
  CodeMissing --> AttemptsLeft
  AttemptsLeft -->|"Да"| RetryCode
  RetryCode --> CodeForm
  AttemptsLeft -->|"Нет"| LockoutError
  LockoutError -->|"Пишет в поддержку"| BalanceSupport
  CodeFound -->|"Да"| CertStatus
  CertStatus -->|"Активен"| BalanceScreen
  CertStatus -->|"Использован"| SpentScreen
  CertStatus -->|"Заблокирован"| BlockedInfo
  BlockedInfo -->|"Пишет в поддержку"| BalanceSupport
  BalanceScreen -->|"Выбрать событие"| ToEvent
  SpentScreen -->|"Покупает новый сертификат"| BuyAgain
  CodeForm -.-> BalanceAssumption
  BalanceScreen -.-> BalanceQuestion
end

subgraph posterFlow ["5. Переход к выбору события"]
direction TB
  PosterEntry(["Вход: из сертификата или письма"]):::transition
  PosterScreen["Экран: Афиша Timepad"]:::screen
  EventScreen["Экран: Страница события"]:::screen
  PaidEvent{"Событие платное?"}:::decision
  FreeEventError["Ошибка: сертификат не действует"]:::error
  BackToPoster(["Система: возврат к афише"]):::system
  TicketScreen["Экран: Выбор билетов"]:::screen
  ToCheckout(["Переход к сценарию: чекаут"]):::transition
  PosterDeferred["Не в MVP: ограничения по городам и организаторам"]:::deferred

  PosterEntry --> PosterScreen
  PosterScreen -->|"Открывает событие"| EventScreen
  EventScreen --> PaidEvent
  PaidEvent -->|"Нет"| FreeEventError
  FreeEventError --> BackToPoster
  BackToPoster --> PosterScreen
  PaidEvent -->|"Да"| TicketScreen
  TicketScreen -->|"Переходит к оплате"| ToCheckout
  PosterScreen -.-> PosterDeferred
end

subgraph checkoutFlow ["6. Использование сертификата в чекауте"]
direction TB
  CheckoutEntry(["Вход: из выбора билетов"]):::transition
  CheckoutScreen["Экран: Чекаут"]:::screen
  ApplyPromo(["Система: применяет промокод"]):::system
  CertField["Экран: Поле подарочного сертификата"]:::screen
  ValidateCert(["Система: проверяет сертификат"]):::system
  CertUsable{"Сертификат можно применить?"}:::decision
  ToCertErrors(["Переход к сценарию: ошибки применения"]):::transition
  LockBalance(["Система: блокирует баланс на время оплаты"]):::system
  EnoughBalance{"Баланса достаточно?"}:::decision
  ToPartial(["Переход к сценарию: частичная оплата"]):::transition
  ChargeCert(["Система: списывает билеты, затем сбор"]):::system
  PaidByCert["Успешно: заказ оплачен сертификатом"]:::success
  RemainderScreen["Экран: Билеты и остаток сертификата"]:::screen
  CheckoutAssumption["Предположение: баланс виден только авторизованным"]:::assumption
  CheckoutQuestion["Открытый вопрос: несколько сертификатов в заказе"]:::question

  CheckoutEntry --> CheckoutScreen
  CheckoutScreen -->|"Вводит промокод"| ApplyPromo
  ApplyPromo --> CertField
  CheckoutScreen -->|"Вводит только сертификат"| CertField
  CertField -->|"Вводит код"| ValidateCert
  ValidateCert --> CertUsable
  CertUsable -->|"Нет"| ToCertErrors
  CertUsable -->|"Да"| LockBalance
  LockBalance --> EnoughBalance
  EnoughBalance -->|"Недостаточно"| ToPartial
  EnoughBalance -->|"Достаточно"| ChargeCert
  ChargeCert --> PaidByCert
  PaidByCert --> RemainderScreen
  CertField -.-> CheckoutAssumption
  CertField -.-> CheckoutQuestion
end

subgraph partialFlow ["7. Частичная оплата сертификат и карта"]
direction TB
  PartialEntry(["Вход: баланса не хватает"]):::transition
  SplitScreen["Экран: Списание и сумма доплаты"]:::screen
  CardScreen["Экран: Доплата картой"]:::screen
  CardResult{"Доплата прошла?"}:::decision
  CardError["Ошибка: доплата не прошла"]:::error
  UnlockBalance(["Система: снимает блокировку баланса"]):::system
  RetryCard(["Система: повторная попытка"]):::system
  ChargeBoth(["Система: списывает сертификат и карту"]):::system
  PartialSuccess["Успешно: заказ оплачен"]:::success
  PartialScreen["Экран: Билеты и обновленный остаток"]:::screen
  PartialQuestion["Открытый вопрос: срок блокировки баланса"]:::question

  PartialEntry --> SplitScreen
  SplitScreen -->|"Подтверждает доплату"| CardScreen
  CardScreen -->|"Оплачивает картой"| CardResult
  CardResult -->|"Ошибка"| CardError
  CardError --> UnlockBalance
  UnlockBalance --> RetryCard
  RetryCard --> CardScreen
  CardResult -->|"Успешно"| ChargeBoth
  ChargeBoth --> PartialSuccess
  PartialSuccess --> PartialScreen
  UnlockBalance -.-> PartialQuestion
end

subgraph certErrors ["8. Ошибки применения сертификата"]
direction TB
  ErrorEntry(["Вход: сертификат не применен"]):::transition
  ErrorReason{"Причина отказа?"}:::decision
  NotFound["Ошибка: код не найден"]:::error
  BlockedCert["Ошибка: сертификат заблокирован"]:::error
  ExpiredCert["Ошибка: срок использования истек"]:::error
  ZeroBalance["Ошибка: баланс исчерпан"]:::error
  NotAllowed["Ошибка: сертификат не действует на заказ"]:::error
  SecondCert["Ошибка: можно применить один сертификат"]:::error
  FixCode["Экран: Повторный ввод кода"]:::screen
  PayByCard["Экран: Оплата картой без сертификата"]:::screen
  PaidWithoutCert["Успешно: заказ оплачен картой"]:::success
  ErrorSupport(["Переход к сценарию: поддержка"]):::transition
  BackToCheckout(["Переход к сценарию: чекаут"]):::transition
  ExpiryQuestion["Открытый вопрос: сгорает ли срок действия"]:::question

  ErrorEntry --> ErrorReason
  ErrorReason -->|"Код не найден"| NotFound
  ErrorReason -->|"Заблокирован"| BlockedCert
  ErrorReason -->|"Истек срок"| ExpiredCert
  ErrorReason -->|"Нулевой баланс"| ZeroBalance
  ErrorReason -->|"Заказ не подходит"| NotAllowed
  ErrorReason -->|"Уже применен другой"| SecondCert
  NotFound -->|"Исправляет код"| FixCode
  SecondCert -->|"Меняет сертификат"| FixCode
  FixCode --> BackToCheckout
  ZeroBalance -->|"Платит картой"| PayByCard
  NotAllowed -->|"Платит картой"| PayByCard
  PayByCard --> PaidWithoutCert
  BlockedCert -->|"Пишет в поддержку"| ErrorSupport
  ExpiredCert -->|"Пишет в поддержку"| ErrorSupport
  ExpiredCert -.-> ExpiryQuestion
end

subgraph ticketRefund ["9. Возврат билета, оплаченного сертификатом"]
direction TB
  RefundEntry(["Вход: заказ в письме или ЛК"]):::transition
  OrderCard["Экран: Мой заказ"]:::screen
  RefundAllowed{"Возврат разрешен правилами события?"}:::decision
  RefundDenied["Ошибка: возврат недоступен"]:::error
  RefundSupport(["Переход к сценарию: поддержка"]):::transition
  RefundPreview["Экран: Куда вернутся деньги"]:::screen
  FeeScreen["Экран: Сервисный сбор не возвращается"]:::screen
  ProcessRefund(["Система: возвращает по источникам оплаты"]):::system
  CertAlive{"Исходный сертификат активен?"}:::decision
  RestoreBalance(["Система: восстанавливает баланс"]):::system
  ReissueCert(["Система: выпускает новый сертификат"]):::system
  RefundDone["Успешно: деньги возвращены"]:::success
  SplitQuestion["Открытый вопрос: порядок распределения возврата"]:::question
  FeeQuestion["Открытый вопрос: ручной возврат сбора"]:::question

  RefundEntry --> OrderCard
  OrderCard -->|"Запрашивает возврат"| RefundAllowed
  RefundAllowed -->|"Нет"| RefundDenied
  RefundDenied -->|"Пишет в поддержку"| RefundSupport
  RefundAllowed -->|"Да"| RefundPreview
  RefundPreview -->|"Смотрит расчет"| FeeScreen
  FeeScreen -->|"Подтверждает возврат"| ProcessRefund
  ProcessRefund --> CertAlive
  CertAlive -->|"Да"| RestoreBalance
  CertAlive -->|"Нет"| ReissueCert
  RestoreBalance --> RefundDone
  ReissueCert --> RefundDone
  ProcessRefund -.-> SplitQuestion
  FeeScreen -.-> FeeQuestion
end

subgraph certRefund ["10. Возврат остатка сертификата через поддержку"]
direction TB
  CertRefundEntry(["Вход: запрос возврата остатка"]):::transition
  SupportForm["Экран: Форма обращения в поддержку"]:::screen
  VerifyOwner(["Система: проверяет код и владение"]):::system
  OwnerOk{"Владение подтверждено?"}:::decision
  OwnerError["Ошибка: владение не подтверждено"]:::error
  DocsScreen["Экран: Дослать подтверждение"]:::screen
  BlockForRefund(["Система: блокирует сертификат"]):::system
  SourceRefund{"Возврат на исходную оплату возможен?"}:::decision
  ReturnMoney(["Система: возвращает остаток"]):::system
  CertRefundDone["Успешно: остаток возвращен"]:::success
  ManualScreen["Экран: Заявка на ручную обработку"]:::screen
  ManualDone["Успешно: возврат согласован вручную"]:::success
  WhoQuestion["Открытый вопрос: кто вправе требовать возврат"]:::question
  TermQuestion["Открытый вопрос: возврат спустя длительный срок"]:::question

  CertRefundEntry --> SupportForm
  SupportForm -->|"Отправляет код и заявление"| VerifyOwner
  VerifyOwner --> OwnerOk
  OwnerOk -->|"Нет"| OwnerError
  OwnerError -->|"Досылает документы"| DocsScreen
  DocsScreen --> VerifyOwner
  OwnerOk -->|"Да"| BlockForRefund
  BlockForRefund --> SourceRefund
  SourceRefund -->|"Да"| ReturnMoney
  ReturnMoney --> CertRefundDone
  SourceRefund -->|"Нет"| ManualScreen
  ManualScreen --> ManualDone
  VerifyOwner -.-> WhoQuestion
  SourceRefund -.-> TermQuestion
end

subgraph supportFlow ["11. Поддержка в пользовательском сценарии"]
direction TB
  SupportEntry(["Вход: обращение пользователя"]):::transition
  SupportChat["Экран: Диалог с поддержкой"]:::screen
  SupportNeed{"Что нужно пользователю?"}:::decision
  FindCert(["Система: поиск по коду, email или заказу"]):::system
  BalanceAnswer["Экран: Ответ с остатком и статусом"]:::screen
  BlockRequest(["Система: блокирует сертификат"]):::system
  BlockedOk["Успешно: сертификат заблокирован"]:::success
  ReissueRequest(["Система: перевыпускает сертификат"]):::system
  NewCertOk["Успешно: новый код отправлен"]:::success
  ToCertRefund(["Переход к сценарию: возврат остатка"]):::transition
  SupportQuestion["Открытый вопрос: порядок подтверждения владения"]:::question

  SupportEntry --> SupportChat
  SupportChat -->|"Описывает проблему"| SupportNeed
  SupportNeed -->|"Узнать остаток"| FindCert
  FindCert --> BalanceAnswer
  SupportNeed -->|"Заблокировать код"| BlockRequest
  BlockRequest --> BlockedOk
  SupportNeed -->|"Перевыпустить"| ReissueRequest
  ReissueRequest --> NewCertOk
  SupportNeed -->|"Вернуть остаток"| ToCertRefund
  SupportChat -.-> SupportQuestion
end

classDef screen fill:#FFFFFF,stroke:#A9A9B8,stroke-width:1.5px,color:#111;
classDef system fill:#F1ECFA,stroke:#7B61A8,stroke-width:1.5px,color:#241A35;
classDef decision fill:#E5EEFF,stroke:#608DDF,stroke-width:1.5px,color:#142C57;
classDef success fill:#E3F6E5,stroke:#57A961,stroke-width:1.5px,color:#173D1D;
classDef error fill:#FFE0E0,stroke:#DE4949,stroke-width:1.5px,color:#8A1717;
classDef question fill:#FFF0BF,stroke:#D99500,stroke-width:1.5px,color:#5C3B00;
classDef assumption fill:#E8F5FF,stroke:#65A9D8,stroke-width:1.5px,stroke-dasharray:5 5,color:#163F5C;
classDef deferred fill:#F3F3F3,stroke:#999999,stroke-width:1.5px,stroke-dasharray:5 5,color:#666666;
classDef transition fill:#FFFFFF,stroke:#777777,stroke-width:1px,stroke-dasharray:3 3,color:#444444;

style buyFlow fill:#FAFAFC,stroke:#C8C8D0
style payFlow fill:#FAFAFC,stroke:#C8C8D0
style deliveryFlow fill:#FAFAFC,stroke:#C8C8D0
style balanceFlow fill:#FAFAFC,stroke:#C8C8D0
style posterFlow fill:#FAFAFC,stroke:#C8C8D0
style checkoutFlow fill:#FAFAFC,stroke:#C8C8D0
style partialFlow fill:#FAFAFC,stroke:#C8C8D0
style certErrors fill:#FAFAFC,stroke:#C8C8D0
style ticketRefund fill:#FAFAFC,stroke:#C8C8D0
style certRefund fill:#FAFAFC,stroke:#C8C8D0
style supportFlow fill:#FAFAFC,stroke:#C8C8D0
```

## Покрытые сценарии

1. Покупка сертификата: выбор номинала и количества, проверка лимита выпуска, данные покупателя и получателя, переход к оплате.
2. Оплата заказа сертификата: резерв выпуска, оплата картой, отказ платежа, истечение резерва, выпуск и активация кодов.
3. Получение сертификата: отправка покупателю или получателю, экран с кодом, скачивание файла, недоставленное письмо и повторная отправка.
4. Проверка баланса и статуса: ввод кода, ошибка кода, лимит попыток, активный, использованный и заблокированный сертификат.
5. Переход к выбору события: афиша, страница события, запрет на бесплатные события.
6. Использование сертификата в чекауте: промокод до сертификата, проверка сертификата, блокировка баланса, списание билетов и затем сбора.
7. Частичная оплата: расчет доплаты, оплата картой, ошибка доплаты, снятие блокировки и повтор.
8. Ошибки применения сертификата: не найден, заблокирован, истек, нулевой баланс, неподходящий заказ, второй сертификат, и следующий шаг для каждой ошибки.
9. Возврат билета, оплаченного сертификатом: правила события, показ распределения возврата, восстановление баланса или перевыпуск.
10. Возврат остатка сертификата через поддержку: заявление, подтверждение владения, блокировка, возврат на исходную оплату или ручная обработка.
11. Действия поддержки, продолжающие пользовательский сценарий: поиск сертификата, блокировка, перевыпуск, передача в возврат остатка.

## Пробелы PRD и открытые вопросы

1. Максимальное количество сертификатов в одном заказе не задано числом, только как настраиваемое значение.
2. Не определен срок резервирования выпуска сертификата в неоплаченном заказе.
3. Канал доставки, кроме email, не подтвержден: телефон упомянут, но сценарий SMS не описан.
4. Не решено, привязывается ли сертификат к личному кабинету Афиши и что это меняет для держателя.
5. Не подтверждено, сколько сертификатов можно применить в одном заказе: MVP предполагает один, но помечено как вопрос к разработке.
6. Не определен срок и механика блокировки баланса на время платежа.
7. Срок действия противоречив: заявлен один год, при этом остаток не должен сгорать. Поведение экрана при истечении срока не описано.
8. Не выбран порядок распределения возврата: пропорционально источникам оплаты или сначала сертификат, затем карта.
9. Не описан пользовательский путь ручного возврата сервисного сбора через поддержку.
10. Не определено, кто вправе требовать возврат остатка: покупатель или предъявитель, и как подтверждается владение.
11. Не подтверждена техническая возможность возврата на исходную оплату спустя длительный срок и сценарий для пользователя, когда это невозможно.
12. Не описано, видит ли неавторизованный пользователь баланс сертификата в чекауте.
13. Не описан экран покупки для нескольких получателей: часть отправить сразу, часть скачать самому.
14. Не описано состояние интерфейса при попытке оплатить сертификатом покупку другого сертификата: запрет заявлен, экран нет.
