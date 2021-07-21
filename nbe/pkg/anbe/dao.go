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
	Enable(id uint, enabled bool) *FileDro
}

type FileDro struct {
	gorm.Model
	Name    string
	Mime    string
	Data    string
	Version uint
	Enabled bool
}

type daoDso struct {
	db *gorm.DB
}

func NewDao(path string) Dao {
	dialect := sqlite.Open(path)
	config := &gorm.Config{}
	db, err := gorm.Open(dialect, config)
	panicIfError(err)
	err = db.AutoMigrate(&FileDro{})
	panicIfError(err)
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

func (dao *daoDso) Create(name string, mime string) *FileDro {
	row := &FileDro{Name: name, Mime: mime}
	result := dao.db.Create(row)
	panicIfError(result.Error)
	return row
}

func (dao *daoDso) Delete(id uint) {
	result := dao.db.Delete(&FileDro{}, id)
	panicIfError(result.Error)
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
	row.Version++
	result = dao.db.Save(row)
	panicIfError(result.Error)
	return row
}

func (dao *daoDso) Enable(id uint, enabled bool) *FileDro {
	row := &FileDro{}
	result := dao.db.First(row, id)
	panicIfError(result.Error)
	row.Enabled = enabled
	result = dao.db.Save(row)
	panicIfError(result.Error)
	return row
}
