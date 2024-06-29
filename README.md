# About

## العربية :

- يعتمد المشروع علي Node ,Express,Mongoose.
- يتم إنشاء مستخدم إفتراضي للنظام حاص بالمبرمج يتم من خلال إنشاء المستخدم الخاص ومدير النظام.
- يتم إنشاء اللغتين العربية والانجليزينة افتراضيا.
- يتم إضافة Routes USers والمستخدمين تلقائيا.
- مجلد Interfaces يحتوي علي :
  - security ويحتوي علي موديلات البيانات التالية :
    - permisions موديل permission والخاص بالصلاحيات.
    - route موديل الراوت.
    - user - موديل المستخدمز
  - shared ويحتوي علي موديل بيانات تفاصيل request والتي يتم تسجيلها تليقائيا مع كل إضافة أو حذف أو تعديل
- shared ويحتوي علي :
  - check-user-permission ويتم التحقق من خلالها بصلاحية المستخدم لتنفيذ هذا الاجراء كإضافة محافظة مثلا.
  - check-user-route -يتم التحق قبل الصلاحية من ان المستخدم له امكانية الدخول لهذا الرابط أم لا.
  - hash-password - ويتم فيه تشفير اي باسودرد.
  - hash-string -نموذج مبسط لعمل تشفير للصلاحيات والعناوين الخاصة بالمستخدم قبل ارسالها في token للمستخدم في client-side.
  - inputs-length - يتم فيها تعريف القيم المطلوبة للبيانات مثلا عدد الارقام في المحمول او الاسم ويتم فحص البيانات في كل شاشاة علي حسب البيانات المطلوبة قبل فحصها أيضا mongoose.
  - pagiantion -القيم الافتراضية للLimit الخاص بالبيانات في حالة search مثلا.
  - permissions-name -يتم فيه تعريف اسم الصلاحية التي يجب ان تكون لدي المستخدم حتي يتكمن من تنفيذ إجراء مثال addGov يجب ان تكون بنفس الاسم ونفس الشكل case-sensitive وايضا يجب التأكد من تعريفها بنفس الشكل في routes-permissions.
  - routes-names بنفس النظام المستعمل في الصلاحيات يجب التأكد من تعريفها في الشاشة الخاصة بالعناوين.
  - set-request-language -وفيها يجب ان اrequest القادم للسرفر يجب ان يعتمد لعغة اما عربي او انجليزي وان لم يوجد djl juddk gym htjvhqdm.
  - set-response-language وفيه يتم تحديد الرسالة التي سيستم إرسالة للمستخدم.
    site يحتيو علي مجموعة من الmethods والتي يتم استخدامها في النظام.
  - system-defualt وفيه يتم تنفيذ مجموعة من الاجراءات عند تشغيب السرفر مع لاتأكد من تنفيذها كل مرة يتم فيها اعادة تشغيل السرفر مثل ان اللغات موجودة.
  - upload-files يتم فيها تحميل ملفات باستخدام multer حاليا يتم تحميل ملف واحد فقط جاري العميل عليها لجلعا تستقبل اكتر من ملف.
  - verify-request - يتم استخدامها middleware مع كل api للتأكد من request ومن صلاحية التوكن والمستخدم ايضاف قبل الشروع في التأكد بعد ذلك من صلاحية المستخدم للدخول علي api ثم بعدها التأكد من صلاحية المستهدام لتنقيذ إجراءا علي api.

## English :

The project depends on Node, Express, and Mongoose.

- A default user for the system is created for the programmer, through the creation of the special user and the system manager.
- Arabic and English languages are created by default.
- Routes Users and Users are added automatically.
- Interfaces folder contains:
  - security and contains the following data models:
    Permissions model for permissions.
    -route route model. - user - User model
    Shared contains the request details data model, which is automatically recorded with each addition, deletion, or modification
- shared and contains:
  - check-user-permission through which the user is verified with the authority to carry out this procedure, such as adding a governorate, for example.
  - check-user-route - It is verified before validation that the user has access to this link or not.
  - hash-password - Any password is encrypted.
  - hash-string - A simplified form to encrypt the permissions and addresses of the user before sending them in the token to the user in the client-side.
  - inputs-length - in which the values required for the data are defined, for example the number of digits in the mobile phone or the name, and the data is checked in each screen according to the required data before examining it also mongoose.
  - pagiantion - The default values for the data limit in the case of search, for example.
  - permissions-name - it defines the name of the permission that the user must have in order for him to be able to execute an action, for example addGov. It must be with the same name and the same form as case-sensitive, and also make sure that it is defined in the same way in routes-permissions.
  - routes-names in the same system used in the permissions, you must make sure that they are defined in the addresses screen.
  - set-request-language - In it, the next request to the server must be based on either Arabic or English, and if there is no djl juddk gym htjvhqdm.
  - set-response-language, which specifies the message that will be sent to the user.
    The site contains a set of methods that are used in the system.
  - system-defualt, in which a set of procedures are executed when the server is turned on, and I make sure that they are executed every time the server is restarted, such as that the languages are present.
  - upload-files In which files are uploaded using multiter. Currently, only one file is uploaded, and the client is running on it, so that you do not receive more than one file.
  - verify-request - middleware is used with each API to verify the request and the validity of the token and the user as well before proceeding to verify that the user is valid to access the API and then verify that the target is authorized to perform an action on the API.

# Dependencies

- Mongoose.
- Mongoose-autopopulate.
- mongoose-paginate-ts.
- bcrypt.
- body-parser.
- browser-detect.
- express.
- multer.
- typescript.

# Contact

    Email: BaherHamed@gmail.com;
    whatsapp: +2001002627613
