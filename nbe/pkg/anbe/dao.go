package anbe

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Dao interface {
	Close()
	All() []FileDro
	Delete(id uint)
	Create(name string, mime string) *FileDro
	Rename(id uint, name string) *FileDro
	Update(id uint, data string) *FileDro
}

type FileDro struct {
	gorm.Model
	Name string
	Mime string
	Data string
}

type daoDso struct {
	db *gorm.DB
}

func NewDao(path string) Dao {
	db, err := gorm.Open(sqlite.Open(path), &gorm.Config{})
	panicIfError(err)
	db.AutoMigrate(&FileDro{})
	return &daoDso{db}
}

func (dao *daoDso) Close() {
	sqlDB, err := dao.db.DB()
	panicIfError(err)
	sqlDB.Close()
}

func (dao *daoDso) All() (files []FileDro) {
	result := dao.db.Find(&files)
	panicIfError(result.Error)
	return
}

func (dao *daoDso) Delete(id uint) {
	result := dao.db.Delete(&FileDro{}, id)
	panicIfError(result.Error)
}

func (dao *daoDso) Create(name string, mime string) *FileDro {
	row := &FileDro{Name: name, Mime: mime}
	result := dao.db.Create(row)
	panicIfError(result.Error)
	return row
}

func (dao *daoDso) Rename(id uint, name string) *FileDro {
	row := &FileDro{}
	result := dao.db.First(row, id)
	panicIfError(result.Error)
	row.Name = name
	result = dao.db.Save(row)
	panicIfError(result.Error)
	return row
}

func (dao *daoDso) Update(id uint, data string) *FileDro {
	row := &FileDro{}
	result := dao.db.First(row, id)
	panicIfError(result.Error)
	row.Data = data
	result = dao.db.Save(row)
	panicIfError(result.Error)
	return row
}
