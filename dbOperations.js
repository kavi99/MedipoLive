const sql = require('mssql')
const { Pool } = require('pg')
var webconfig = {
    user: 'dogukan00',
    password: 'dogukan.12',
    server: 'MpChats.mssql.somee.com',
    database: 'MpChats',
    port: 1433
};
const pool = new sql.ConnectionPool(webconfig);
module.exports.memberinsert = function (req, res) {
    sql.connect(webconfig, function (err) {
        if (err) console.log(err);
        var request1 = new sql.Request();

        request1.query("Select dbo.fn_UyeKontrol('" + req.body.KullaniciAd + "','" + req.body.Eposta + "') as UyeKontrol", function (err, Kontrol) {
            if (err) {
                console.log(err);
            }

            Kontrol.recordset.forEach(function (kullanici) {
                if (kullanici.UyeKontrol == "Evet") {
                    res.render('UyeOl', { hata: 'Kullanıcı adı veya e posta bulunmaktadır !' });
                    sql.close();
                }
                else {

                    var request1 = new sql.Request();
                    request1.query("insert into Kullanici(KullaniciAd,Sifre,Email,GuvenlikSorusu,Cevap) values ('" + req.body.KullaniciAd + "','" + req.body.Sifre + "','" + req.body.Eposta + "','" + req.body.Soru + "','" + req.body.Cevap + "')", function (err, recordset) {
                        if (err) {
                            console.log(err);
                        }
                        res.render('giris', { hata: '' });
                        sql.close();

                    });
                }
            });

        });


    });
}
module.exports.UyeOl = function (req, res) {
    res.render('UyeOl', { hata: '' });
}
module.exports.Giris = function (req, res) {
    res.render('giris', { hata: '' });
}
module.exports.msgEkle = async function (msg, nick, oda, req, res) {
    /*sql.connect(webconfig, function (err) {
        if (err) console.log(err);
        var request1 = new sql.Request();
        request1.query("insert into Mesajlar VALUES ('" + msg + "',(select Id from Kullanici where KullaniciAd = '" + nick + "'),GETDATE(),'" + oda + "'", function (err, verisonucu) {
            if (err) {
                console.log(err);
            }
            sql.close();
        });
    });*/
    //const pool = new sql.ConnectionPool(webconfig);
    pool.query("insert into Mesajlar VALUES ('" + msg + "',(select Id from Kullanici where KullaniciAd = '" + nick + "'),GETDATE(),'" + oda + "'", function (err, rows, fields) {
        if (err) throw err;

        console.log('The solution is: ', rows[0].solution);
    });

}
module.exports.GirisYapildi = function (req, res) {
    sql.connect(webconfig, function (err) {
        if (err) console.log(err);
        var request1 = new sql.Request();
        request1.query("Select dbo.fn_UyeVarmi('" + req.body.ad + "','" + req.body.sifre + "') as Sonuc", function (err, verisonucu) {
            if (err) {
                console.log(err);
            }
            verisonucu.recordset.forEach(function (kullanici) {
                if (kullanici.Sonuc == "Evet") {
                    var request1 = new sql.Request();
                    request1.query("insert into AktifKullanici values('" + req.body.ad + "',GETDATE())", function (err, recordset) {
                        if (err) {
                            console.log(err);
                        }
                        request1.query("select * from Mesajlar m,kullanici k where odaAdi = 'Genel' and m.userID = k.Id", function (err, mesajlar) {
                            if (err) {
                                console.log(err);
                            }
                            sql.close();
                            res.render('genel', { nick: req.body.ad, mesajlar: mesajlar.recordset });

                        });
                    });
                }
                else {
                    res.render('giris', { hata: 'Kullanici Adi veya Şifre Hatalı !' })
                    sql.close();
                }
            });
        });
    });
}

module.exports.sifre = function (req, res) {
    res.render('sifre', { hata: '' });
}
module.exports.YeniSifre = function (req, res) {

    sql.connect(webconfig, function (err) {
        if (err) console.log(err);
        var request1 = new sql.Request();
        request1.query(" Select dbo.fn_SifreYenileme('" + req.body.Email + "','" + req.body.Cevaps + "') as SifreSonuc", function (err, verisonucu) {
            if (err) {
                console.log(err);
            }
            verisonucu.recordset.forEach(function (kullanici) {
                if (kullanici.SifreSonuc == "Evet") {
                    res.render('SifreYenileme', { Email: req.body.Email, Cevap: req.body.Cevaps, soru: req.body.soru, hata: '' });
                }
                else {
                    res.render('sifre', { hata: 'Lütfen bilgilerinizi kontrol ediniz !' })
                }
            });
            sql.close();
        });
    });
}

module.exports.sifreUpdate = function (req, res) {
    if (req.body.password1 != req.body.password2) {
        res.render('SifreYenileme', { Email: req.body.Email, Cevap: req.body.Cevaps, soru: req.body.soru, hata: 'Şifreler Uyuşmuyor !' });
    }
    sql.connect(webconfig, function (err) {
        if (err) console.log(err);
        var request1 = new sql.Request();
        request1.query("update kullanici set Sifre='" + req.body.password1 + "' where Email='" + req.body.Email + "' and Cevap='" + req.body.Cevaps + "'", function (err, verisonucu) {
            if (err) {
                console.log(err);
            }
            res.render('giris', { hata: '' })
            sql.close();
        });
    });
}









/*
module.exports.YeniSifre = function (req, res) {
    sql.connect(webconfig, function (err) {
        if (err) console.log(err);
        var request1 = new sql.Request();
        request1.query("update kullanici set Sifre='" + req.body.password2 + "' where Email='" + req.body.Email + "'  and Cevap='" + req.body.Cevaps + "'", function (err, verisonucu) {
            if (err) {
                console.log(err);
            }

            res.render('giris',{hata:''});
             sql.close();
        });

    });
}*/
